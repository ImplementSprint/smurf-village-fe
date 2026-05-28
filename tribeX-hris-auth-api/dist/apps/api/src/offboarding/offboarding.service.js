"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OffboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingService = void 0;
exports.buildVacatedPositionTitle = buildVacatedPositionTitle;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
const common_2 = require("../../../../libs/common/src");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const cnb_service_1 = require("../cnb/cnb.service");
const cnb_encryption_service_1 = require("../cnb/cnb-encryption.service");
function buildVacatedPositionTitle(input) {
    const specificPositionTitle = input.specificPositionTitle?.trim();
    if (specificPositionTitle) {
        return `${specificPositionTitle} (Vacated Position)`;
    }
    return `Vacated Position (${input.firstName} ${input.lastName})`;
}
let OffboardingService = OffboardingService_1 = class OffboardingService {
    supabaseService;
    auditService;
    notificationsService;
    cnbService;
    encryption;
    logger = new common_1.Logger(OffboardingService_1.name);
    defaultSystemAccessOptions = [
        'Email',
        'HRIS System',
        'Timekeeping System',
    ];
    constructor(supabaseService, auditService, notificationsService, cnbService, encryption) {
        this.supabaseService = supabaseService;
        this.auditService = auditService;
        this.notificationsService = notificationsService;
        this.cnbService = cnbService;
        this.encryption = encryption;
    }
    roundCurrency(value) {
        return Math.round(value * 100) / 100;
    }
    decryptPayslipFields(row) {
        const fields = [
            'basic_pay_earned', 'total_allowances', 'gross_pay',
            'tax_deduction', 'statutory_deductions', 'total_deductions', 'net_pay',
        ];
        const result = { ...row };
        for (const f of fields) {
            if (result[f] != null) {
                result[f] = this.encryption.decrypt(String(result[f]));
            }
        }
        return result;
    }
    parsePayslipMetadata(value) {
        if (typeof value !== 'string' || !value.trim())
            return null;
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed
                : null;
        }
        catch {
            return null;
        }
    }
    isSettlementPayslipForCase(row, caseId) {
        const metadata = this.parsePayslipMetadata(row.other_deductions);
        return metadata?.settlement_case_id === caseId;
    }
    isOffboardingSettlementPayslip(row) {
        const metadata = this.parsePayslipMetadata(row.other_deductions);
        return metadata?.settlement_type === 'offboarding_final_pay';
    }
    async findSettlementPayslips(companyId, caseId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select('payslip_id, other_deductions')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(25);
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'findSettlementPayslips', this.logger);
        }
        return (data ?? []).filter((row) => this.isSettlementPayslipForCase(row, caseId));
    }
    async updateSettlementPayslipStatus(companyId, caseId, status) {
        const supabase = this.supabaseService.getClient();
        const payslips = await this.findSettlementPayslips(companyId, caseId);
        const payslipIds = payslips.map((row) => String(row.payslip_id ?? '')).filter(Boolean);
        if (payslipIds.length === 0)
            return;
        const { error } = await supabase
            .from('cnb_payslips')
            .update({ status })
            .in('payslip_id', payslipIds);
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'updateSettlementPayslipStatus', this.logger);
        }
    }
    async getFinalSettlementPayslip(caseId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select('payslip_id, basic_pay_earned, total_allowances, gross_pay, tax_deduction, statutory_deductions, total_deductions, net_pay, status, employee_ack_status, created_at, other_deductions, period:period_id(period_id, cutoff_start_date, cutoff_end_date, payout_date, status)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(25);
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getFinalSettlementPayslip', this.logger);
        }
        const settlementPayslip = (data ?? []).find((row) => this.isSettlementPayslipForCase(row, caseId));
        if (!settlementPayslip)
            return null;
        return this.decryptPayslipFields(settlementPayslip);
    }
    async ensureFinalSettlementPeriod(caseId, companyId, lastWorkingDay, processedBy) {
        const supabase = this.supabaseService.getClient();
        const { data: existing, error: existingError } = await supabase
            .from('cnb_payroll_periods')
            .select('period_id')
            .eq('company_id', companyId)
            .eq('payout_date', lastWorkingDay)
            .eq('status', 'Final Settlement')
            .maybeSingle();
        if (existingError) {
            common_2.DatabaseErrorHandler.handle(existingError, 'ensureFinalSettlementPeriod', this.logger);
        }
        if (existing)
            return existing.period_id;
        const { data, error } = await supabase
            .from('cnb_payroll_periods')
            .insert({
            period_id: crypto.randomUUID(),
            company_id: companyId,
            cutoff_start_date: lastWorkingDay,
            cutoff_end_date: lastWorkingDay,
            payout_date: lastWorkingDay,
            status: 'Final Settlement',
            processed_by: processedBy,
            processed_at: new Date().toISOString(),
        })
            .select('period_id')
            .single();
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'ensureFinalSettlementPeriod', this.logger);
        }
        if (!data) {
            throw new common_1.BadRequestException('Failed to create final settlement period');
        }
        return data.period_id;
    }
    async syncFinalSettlementPayslip(input) {
        const supabase = this.supabaseService.getClient();
        const periodId = await this.ensureFinalSettlementPeriod(input.caseId, input.companyId, input.lastWorkingDay, input.actorId);
        const enc = (n) => this.encryption.encryptNumber(this.roundCurrency(n));
        const otherDeductionDetails = {
            settlement_case_id: input.caseId,
            settlement_type: 'offboarding_final_pay',
            leave_encashment: this.roundCurrency(input.finalPay.leave_encashment),
            additional_pay: this.roundCurrency(input.finalPay.additional_pay),
            tax_deduction: this.roundCurrency(input.finalPay.tax_deduction),
            statutory_deductions: this.roundCurrency(input.finalPay.statutory_deductions),
        };
        const otherDeductions = JSON.stringify(input.breakdown
            ? { ...otherDeductionDetails, ...input.breakdown }
            : otherDeductionDetails);
        const grossPay = input.finalPay.salary_balance +
            input.finalPay.leave_encashment +
            input.finalPay.additional_pay;
        const payslipPayload = {
            period_id: periodId,
            user_id: input.employeeId,
            company_id: input.companyId,
            basic_pay_earned: enc(input.finalPay.salary_balance),
            total_allowances: enc(input.finalPay.leave_encashment + input.finalPay.additional_pay),
            gross_pay: enc(grossPay),
            tax_deduction: enc(input.finalPay.tax_deduction),
            statutory_deductions: enc(input.finalPay.statutory_deductions),
            other_deductions: otherDeductions,
            total_deductions: enc(input.finalPay.deductions),
            net_pay: enc(input.finalPay.total_amount),
            status: input.finalPay.status === 'Transfer Confirmed' ? 'Transfer Confirmed' : 'Final Pay',
            employee_ack_status: 'Pending',
        };
        const { data: existing, error: existingError } = await supabase
            .from('cnb_payslips')
            .select('payslip_id, employee_ack_status, acknowledged_at')
            .eq('period_id', periodId)
            .eq('user_id', input.employeeId)
            .maybeSingle();
        if (existingError) {
            common_2.DatabaseErrorHandler.handle(existingError, 'syncFinalSettlementPayslip', this.logger);
        }
        const query = existing
            ? supabase
                .from('cnb_payslips')
                .update({
                ...payslipPayload,
                employee_ack_status: existing.employee_ack_status ?? 'Pending',
                acknowledged_at: existing.acknowledged_at ?? null,
            })
                .eq('payslip_id', existing.payslip_id)
            : supabase
                .from('cnb_payslips')
                .insert({
                payslip_id: crypto.randomUUID(),
                ...payslipPayload,
            });
        const { data, error } = await query.select('*').single();
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'syncFinalSettlementPayslip', this.logger);
        }
        return data;
    }
    async getLinkedPayrollReference(employeeId, companyId, lastWorkingDay) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select('payslip_id, net_pay, gross_pay, total_deductions, created_at, status, other_deductions, period:period_id(period_id, cutoff_start_date, cutoff_end_date, payout_date)')
            .eq('user_id', employeeId)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(25);
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getLinkedPayrollReference', this.logger);
        }
        const linkedPayroll = data?.find((row) => !this.isOffboardingSettlementPayslip(row));
        if (!linkedPayroll)
            return null;
        return this.decryptPayslipFields(linkedPayroll);
    }
    async recomputeFinalPayFromCompensation(caseId) {
        const supabase = this.supabaseService.getClient();
        const { data: offboardingCase } = await supabase
            .from('offboarding_cases')
            .select('case_id, employee_id, initiated_by_id, last_working_day')
            .eq('case_id', caseId)
            .maybeSingle();
        if (!offboardingCase) {
            throw new common_1.NotFoundException('Offboarding case not found.');
        }
        const { data: employee } = await supabase
            .from('user_profile')
            .select('company_id')
            .eq('user_id', offboardingCase.employee_id)
            .maybeSingle();
        const companyId = employee?.company_id;
        if (!companyId) {
            throw new common_1.BadRequestException('Employee company context is missing.');
        }
        if (!offboardingCase.last_working_day) {
            throw new common_1.BadRequestException('Last working day is required before computing final pay.');
        }
        const computed = await this.cnbService.computeOffboardingFinalPay(offboardingCase.employee_id, companyId, offboardingCase.last_working_day);
        const updatePayload = {
            salary_balance: computed.salary_balance,
            leave_encashment: computed.leave_encashment,
            additional_pay: computed.additional_pay,
            deductions: computed.deductions,
            total_amount: computed.total_amount,
            status: 'Ready for Review',
        };
        const existingRows = await this.listFinalPayRecords(caseId);
        let data = null;
        if (existingRows.length > 0) {
            const { data: updatedRows, error } = await supabase
                .from('final_pay')
                .update(updatePayload)
                .eq('case_id', caseId)
                .select('*');
            if (error)
                common_2.DatabaseErrorHandler.handle(error, 'recomputeFinalPayFromCompensation-update', this.logger);
            data = this.pickCurrentFinalPay(updatedRows);
        }
        else {
            const { data: inserted, error } = await supabase
                .from('final_pay')
                .insert({ case_id: caseId, ...updatePayload })
                .select('*')
                .single();
            if (error)
                common_2.DatabaseErrorHandler.handle(error, 'recomputeFinalPayFromCompensation-insert', this.logger);
            data = inserted;
        }
        let settlement_payslip = null;
        try {
            settlement_payslip = await this.syncFinalSettlementPayslip({
                caseId,
                companyId,
                employeeId: offboardingCase.employee_id,
                actorId: offboardingCase.initiated_by_id ?? offboardingCase.employee_id,
                lastWorkingDay: offboardingCase.last_working_day,
                finalPay: {
                    salary_balance: computed.salary_balance,
                    leave_encashment: computed.leave_encashment,
                    additional_pay: computed.additional_pay,
                    tax_deduction: computed.breakdown.tax,
                    statutory_deductions: computed.breakdown.statutory.total,
                    deductions: computed.deductions,
                    total_amount: computed.total_amount,
                    status: 'Ready for Review',
                },
                breakdown: computed.breakdown,
            });
        }
        catch (syncErr) {
            this.logger.warn(`Final pay computed but payslip sync failed for case ${caseId}: ${syncErr?.message ?? syncErr}`);
        }
        return {
            ...data,
            computed_breakdown: computed.breakdown,
            settlement_payslip,
        };
    }
    async enableOffboardingModule(companyId, performedBy) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('tenant_modules')
            .upsert({ company_id: companyId, module_name: 'offboarding', status: 'Active' }, { onConflict: 'company_id,module_name' });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'enableOffboardingModule', this.logger);
        }
        this.auditService.log(`OFFBOARDING_MODULE_ENABLED for company ${companyId}`, performedBy, companyId)
            .catch(err => this.logger.error('Audit failed in enableOffboardingModule', err));
        return { message: 'Offboarding module enabled', company_id: companyId, status: 'Active' };
    }
    async disableOffboardingModule(companyId, performedBy) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('tenant_modules')
            .upsert({ company_id: companyId, module_name: 'offboarding', status: 'Inactive' }, { onConflict: 'company_id,module_name' });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'disableOffboardingModule', this.logger);
        }
        this.auditService.log(`OFFBOARDING_MODULE_DISABLED for company ${companyId}`, performedBy, companyId)
            .catch(err => this.logger.error('Audit failed in disableOffboardingModule', err));
        return { message: 'Offboarding module disabled', company_id: companyId, status: 'Inactive' };
    }
    async getOffboardingAuditLogs(filters) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('admin_audit_logs')
            .select('*, performer:user_profile!admin_audit_logs_performed_by_fkey(first_name, last_name)')
            .ilike('action', 'OFFBOARDING%')
            .order('timestamp', { ascending: false })
            .limit(100);
        if (filters?.company_id)
            query = query.eq('company_id', filters.company_id);
        if (filters?.employee_id)
            query = query.eq('target_user_id', filters.employee_id);
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async configureChecklistTemplate(dto, companyId, hrUserId) {
        const supabase = this.supabaseService.getClient();
        const templateId = crypto.randomUUID();
        const applicableTypes = [...new Set((dto.applicable_offboarding_types ?? []).filter(Boolean))];
        const systemAccessToRevoke = [...new Set((dto.system_access_to_revoke ?? [])
                .map((value) => String(value).trim())
                .filter((value) => value.length > 0))];
        const { data: template, error: tErr } = await supabase
            .from('offboarding_checklist_templates')
            .insert({
            template_id: templateId,
            company_id: companyId,
            template_name: dto.template_name,
            employee_type: dto.employee_type ?? null,
            description: dto.description ?? null,
            applicable_offboarding_types: applicableTypes,
            is_default: dto.is_default ?? false,
            require_knowledge_transfer: dto.require_knowledge_transfer ?? true,
            system_access_to_revoke: systemAccessToRevoke,
            created_by: hrUserId,
        })
            .select().single();
        if (tErr)
            throw new common_1.BadRequestException(tErr.message);
        if (dto.items?.length > 0) {
            const rows = dto.items.map(item => ({
                item_id: crypto.randomUUID(),
                template_id: templateId,
                item_name: item.item_name,
                description: item.description ?? null,
                is_required: item.is_required,
                category: item.category ?? null,
                is_custom: item.is_custom ?? false,
            }));
            const { error: iErr } = await supabase.from('offboarding_checklist_template_items').insert(rows);
            if (iErr) {
                common_2.DatabaseErrorHandler.handle(iErr, 'configureChecklistTemplate', this.logger);
            }
        }
        this.auditService.log(`OFFBOARDING_TEMPLATE_CREATED: ${dto.template_name}`, hrUserId, companyId)
            .catch(err => this.logger.error('Audit failed in configureChecklistTemplate', err));
        return { ...template, items: dto.items };
    }
    async getChecklistTemplates(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('offboarding_checklist_templates')
            .select('*, offboarding_checklist_template_items(*)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getChecklistTemplates', this.logger);
        }
        return data ?? [];
    }
    async getSystemAccessOptions(companyId) {
        const supabase = this.supabaseService.getClient();
        const options = new Set(this.defaultSystemAccessOptions);
        const { data: templates, error: templateError } = await supabase
            .from('offboarding_checklist_templates')
            .select('system_access_to_revoke')
            .eq('company_id', companyId);
        if (templateError) {
            common_2.DatabaseErrorHandler.handle(templateError, 'getSystemAccessOptions.templates', this.logger);
        }
        for (const template of templates ?? []) {
            const configuredSystems = Array.isArray(template?.system_access_to_revoke)
                ? template.system_access_to_revoke
                : [];
            for (const value of configuredSystems) {
                const normalized = String(value ?? '').trim();
                if (normalized)
                    options.add(normalized);
            }
        }
        const { data: companyEmployees, error: employeeError } = await supabase
            .from('user_profile')
            .select('user_id')
            .eq('company_id', companyId);
        if (employeeError) {
            common_2.DatabaseErrorHandler.handle(employeeError, 'getSystemAccessOptions.companyEmployees', this.logger);
        }
        const employeeIds = (companyEmployees ?? [])
            .map((row) => String(row.user_id ?? '').trim())
            .filter(Boolean);
        if (employeeIds.length > 0) {
            const { data: companyCases, error: caseError } = await supabase
                .from('offboarding_cases')
                .select('case_id')
                .in('employee_id', employeeIds);
            if (caseError) {
                common_2.DatabaseErrorHandler.handle(caseError, 'getSystemAccessOptions.cases', this.logger);
            }
            const caseIds = (companyCases ?? [])
                .map((row) => String(row.case_id ?? '').trim())
                .filter(Boolean);
            if (caseIds.length === 0) {
                return [...options].sort((a, b) => a.localeCompare(b));
            }
            const { data: systemRows, error: systemError } = await supabase
                .from('system_access')
                .select('system_name')
                .in('case_id', caseIds);
            if (systemError) {
                common_2.DatabaseErrorHandler.handle(systemError, 'getSystemAccessOptions.system_access', this.logger);
            }
            for (const row of systemRows ?? []) {
                const normalized = String(row?.system_name ?? '').trim();
                if (normalized)
                    options.add(normalized);
            }
        }
        return [...options].sort((a, b) => a.localeCompare(b));
    }
    async updateChecklistTemplate(templateId, dto, companyId, actorUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing, error: findErr } = await supabase
            .from('offboarding_checklist_templates')
            .select('template_id, company_id')
            .eq('template_id', templateId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findErr)
            throw new common_1.BadRequestException(findErr.message);
        if (!existing)
            throw new common_1.NotFoundException('Checklist template not found.');
        const { data: updatedTemplate, error: updateErr } = await supabase
            .from('offboarding_checklist_templates')
            .update({
            template_name: dto.template_name,
            employee_type: dto.employee_type ?? null,
            description: dto.description ?? null,
            applicable_offboarding_types: [...new Set((dto.applicable_offboarding_types ?? []).filter(Boolean))],
            is_default: dto.is_default ?? false,
            require_knowledge_transfer: dto.require_knowledge_transfer ?? true,
            system_access_to_revoke: [...new Set((dto.system_access_to_revoke ?? [])
                    .map((value) => String(value).trim())
                    .filter((value) => value.length > 0))],
        })
            .eq('template_id', templateId)
            .eq('company_id', companyId)
            .select()
            .single();
        if (updateErr)
            throw new common_1.BadRequestException(updateErr.message);
        const { error: deleteItemsErr } = await supabase
            .from('offboarding_checklist_template_items')
            .delete()
            .eq('template_id', templateId);
        if (deleteItemsErr) {
            common_2.DatabaseErrorHandler.handle(deleteItemsErr, 'updateChecklistTemplate.deleteItems', this.logger);
        }
        if (dto.items?.length) {
            const rows = dto.items.map((item) => ({
                item_id: crypto.randomUUID(),
                template_id: templateId,
                item_name: item.item_name,
                description: item.description ?? null,
                is_required: item.is_required,
                category: item.category ?? null,
                is_custom: item.is_custom ?? false,
            }));
            const { error: insertItemsErr } = await supabase
                .from('offboarding_checklist_template_items')
                .insert(rows);
            if (insertItemsErr) {
                common_2.DatabaseErrorHandler.handle(insertItemsErr, 'updateChecklistTemplate.insertItems', this.logger);
            }
        }
        this.auditService.log(`OFFBOARDING_TEMPLATE_UPDATED: ${dto.template_name}`, actorUserId, companyId).catch((err) => this.logger.error('Audit failed in updateChecklistTemplate', err));
        return { ...updatedTemplate, items: dto.items ?? [] };
    }
    async deleteChecklistTemplate(templateId, companyId, actorUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing, error: findErr } = await supabase
            .from('offboarding_checklist_templates')
            .select('template_id, template_name, company_id')
            .eq('template_id', templateId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findErr)
            throw new common_1.BadRequestException(findErr.message);
        if (!existing)
            throw new common_1.NotFoundException('Checklist template not found.');
        const { error: deleteItemsErr } = await supabase
            .from('offboarding_checklist_template_items')
            .delete()
            .eq('template_id', templateId);
        if (deleteItemsErr) {
            common_2.DatabaseErrorHandler.handle(deleteItemsErr, 'deleteChecklistTemplate.deleteItems', this.logger);
        }
        const { error: deleteTemplateErr } = await supabase
            .from('offboarding_checklist_templates')
            .delete()
            .eq('template_id', templateId)
            .eq('company_id', companyId);
        if (deleteTemplateErr) {
            common_2.DatabaseErrorHandler.handle(deleteTemplateErr, 'deleteChecklistTemplate.deleteTemplate', this.logger);
        }
        this.auditService.log(`OFFBOARDING_TEMPLATE_DELETED: ${existing.template_name ?? templateId}`, actorUserId, companyId).catch((err) => this.logger.error('Audit failed in deleteChecklistTemplate', err));
        return { success: true };
    }
    async resetCase(caseId, actorUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: caseRow, error: caseError } = await supabase
            .from('offboarding_cases')
            .select('case_id, employee_id, status')
            .eq('case_id', caseId)
            .maybeSingle();
        if (caseError)
            throw new common_1.BadRequestException(caseError.message);
        if (!caseRow)
            throw new common_1.NotFoundException('Offboarding case not found.');
        if (caseRow.status === 'Completed') {
            throw new common_1.BadRequestException('Completed offboarding cases cannot be reset.');
        }
        const { data: employee, error: employeeError } = await supabase
            .from('user_profile')
            .select('company_id')
            .eq('user_id', caseRow.employee_id)
            .maybeSingle();
        if (employeeError)
            throw new common_1.BadRequestException(employeeError.message);
        const companyId = employee?.company_id ?? '';
        await Promise.all([
            supabase.from('resignation_details').delete().eq('case_id', caseId),
            supabase.from('termination_details').delete().eq('case_id', caseId),
            supabase.from('checklist_items').delete().eq('case_id', caseId),
            supabase.from('knowledge_transfer').delete().eq('case_id', caseId),
            supabase.from('system_access').delete().eq('case_id', caseId),
            supabase.from('final_pay').delete().eq('case_id', caseId),
            supabase.from('clearance_documents').delete().eq('case_id', caseId),
            supabase.from('offboarding_vacant_positions').delete().eq('case_id', caseId),
            supabase.from('payroll_log').delete().eq('case_id', caseId).eq('type', 'final_pay_offboarding'),
            supabase
                .from('cnb_payslips')
                .delete()
                .in('payslip_id', (await this.findSettlementPayslips(companyId, caseId))
                .map((row) => String(row.payslip_id ?? ''))
                .filter(Boolean)),
        ]);
        const { error: deleteCaseError } = await supabase
            .from('offboarding_cases')
            .delete()
            .eq('case_id', caseId);
        if (deleteCaseError)
            throw new common_1.BadRequestException(deleteCaseError.message);
        this.auditService.log(`OFFBOARDING_CASE_RESET: case ${caseId}`, actorUserId, companyId, caseRow.employee_id).catch((err) => this.logger.error('Audit failed in resetCase', err));
        return { success: true, case_id: caseId };
    }
    async createCase(dto, initiatedById) {
        const supabase = this.supabaseService.getClient();
        const { data: employee, error: empErr } = await supabase
            .from('user_profile')
            .select('user_id, first_name, last_name, company_id, email, department_id')
            .eq('user_id', dto.employee_id)
            .maybeSingle();
        if (empErr || !employee)
            throw new common_1.NotFoundException('Employee not found.');
        const { data: existing } = await supabase
            .from('offboarding_cases')
            .select('case_id')
            .eq('employee_id', dto.employee_id)
            .not('status', 'in', '("Completed","Rejected")')
            .maybeSingle();
        if (existing)
            throw new common_1.BadRequestException('Employee already has an active offboarding case.');
        const { data: newCase, error: caseErr } = await supabase
            .from('offboarding_cases')
            .insert({
            employee_id: dto.employee_id,
            initiated_by_id: initiatedById,
            offboarding_type: dto.offboarding_type,
            last_working_day: dto.last_working_day,
            selected_template_id: dto.template_id ?? null,
            status: 'Submitted',
        })
            .select().single();
        if (caseErr)
            throw new common_1.BadRequestException(caseErr.message);
        const caseId = newCase.case_id;
        const emp = employee;
        const employeeName = `${emp.first_name} ${emp.last_name}`;
        if (dto.offboarding_type === 'Resignation' && dto.resignation) {
            await supabase.from('resignation_details').insert({ case_id: caseId, ...dto.resignation });
        }
        if (dto.offboarding_type === 'Termination' && dto.termination) {
            await supabase.from('termination_details').insert({ case_id: caseId, ...dto.termination });
        }
        await supabase.from('knowledge_transfer').insert({ case_id: caseId });
        const defaultSystems = ['Email', 'HRIS System', 'Timekeeping System'];
        await supabase.from('system_access').insert(defaultSystems.map(s => ({ case_id: caseId, system_name: s })));
        this.notificationsService.notifyAllHRInCompany(emp.company_id, {
            type: 'OFFBOARDING_SUBMITTED',
            title: 'New Offboarding Case',
            message: `${employeeName} has submitted an offboarding request (${dto.offboarding_type}).`,
            metadata: { case_id: caseId, employee_id: dto.employee_id },
        }).catch(err => this.logger.error('Failed to notify HR in createCase', err));
        if (emp.department_id) {
            const { data: managers } = await supabase
                .from('user_profile')
                .select('user_id, role:role_id(role_name)')
                .eq('company_id', emp.company_id)
                .eq('department_id', emp.department_id)
                .then(res => ({
                ...res,
                data: (res.data ?? []).filter((u) => u.role?.role_name === 'Manager'),
            }));
            if (managers && managers.length > 0) {
                await Promise.allSettled(managers.map(mgr => this.notificationsService.createNotification({
                    userId: mgr.user_id,
                    companyId: emp.company_id,
                    type: 'OFFBOARDING_SUBMITTED',
                    title: 'Team Member Resignation Submitted',
                    message: `${employeeName} has submitted a resignation request. Please acknowledge it in the offboarding section.`,
                    metadata: { case_id: caseId, employee_id: dto.employee_id },
                }).catch(err => this.logger.error('Failed to notify manager in createCase', err))));
            }
        }
        this.auditService.log(`OFFBOARDING_CASE_CREATED: case ${caseId} type=${dto.offboarding_type}`, initiatedById, emp.company_id, dto.employee_id).catch(err => this.logger.error('Audit failed in createCase', err));
        this.logger.log(`Offboarding case created: ${caseId}`);
        return newCase;
    }
    async getMyCaseByEmployeeId(userId) {
        const supabase = this.supabaseService.getClient();
        const { data } = await supabase
            .from('offboarding_cases')
            .select('case_id')
            .eq('employee_id', userId)
            .order('created_at', { ascending: false })
            .limit(1).maybeSingle();
        if (!data)
            return null;
        return this.getCaseById(data.case_id);
    }
    async getAllCases(filters) {
        const supabase = this.supabaseService.getClient();
        let query = supabase.from('offboarding_cases').select('*').order('created_at', { ascending: false });
        if (filters?.status)
            query = query.eq('status', filters.status);
        if (filters?.offboarding_type)
            query = query.eq('offboarding_type', filters.offboarding_type);
        const { data: cases, error } = await query;
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getAllCases', this.logger);
        }
        return Promise.all((cases ?? []).map(async (c) => {
            const { data: emp } = await supabase
                .from('user_profile').select('first_name, last_name, role_id').eq('user_id', c.employee_id).maybeSingle();
            const employeeRoleId = String(emp?.role_id ?? '').trim();
            const employeeRoleName = employeeRoleId.length > 0
                ? await supabase
                    .from('role')
                    .select('role_name')
                    .eq('role_id', employeeRoleId)
                    .maybeSingle()
                    .then((result) => String(result.data?.role_name ?? '').trim() || null)
                : null;
            return {
                ...c,
                employee_name: emp ? `${emp.first_name} ${emp.last_name}` : null,
                employee_role_name: employeeRoleName,
            };
        }));
    }
    async getCaseById(caseId) {
        const supabase = this.supabaseService.getClient();
        const { data: c, error } = await supabase
            .from('offboarding_cases').select('*').eq('case_id', caseId).maybeSingle();
        if (error || !c)
            throw new common_1.NotFoundException('Offboarding case not found.');
        const { data: emp } = await supabase
            .from('user_profile').select('first_name, last_name, company_id, role_id').eq('user_id', c.employee_id).maybeSingle();
        const employeeRoleId = String(emp?.role_id ?? '').trim();
        const employeeRoleName = employeeRoleId.length > 0
            ? await supabase
                .from('role')
                .select('role_name')
                .eq('role_id', employeeRoleId)
                .maybeSingle()
                .then((result) => String(result.data?.role_name ?? '').trim() || null)
            : null;
        const [resignation, termination, checklist, kt, systemAccess, finalPay, clearance, vacantPosition] = await Promise.all([
            supabase.from('resignation_details').select('*').eq('case_id', caseId).maybeSingle().then(r => r.data),
            supabase.from('termination_details').select('*').eq('case_id', caseId).maybeSingle().then(r => r.data),
            supabase.from('checklist_items').select('*').eq('case_id', caseId).then(r => r.data ?? []),
            supabase.from('knowledge_transfer').select('*').eq('case_id', caseId).maybeSingle().then(r => r.data),
            supabase.from('system_access').select('*').eq('case_id', caseId).then(r => r.data ?? []),
            this.getLatestFinalPayRecord(caseId),
            supabase.from('clearance_documents').select('*').eq('case_id', caseId).then(r => r.data ?? []),
            supabase.from('offboarding_vacant_positions').select('status, job_posting_id').eq('case_id', caseId).maybeSingle().then(r => r.data),
        ]);
        const payroll_reference = await this.getLinkedPayrollReference(c.employee_id, emp?.company_id ?? '', c.last_working_day ?? null);
        const settlement_payslip = await this.getFinalSettlementPayslip(caseId, emp?.company_id ?? '');
        return {
            ...c,
            employee_name: emp ? `${emp.first_name} ${emp.last_name}` : null,
            employee_role_name: employeeRoleName,
            resignation_details: resignation ?? null,
            termination_details: termination ?? null,
            checklist_items: checklist,
            knowledge_transfer: kt ?? null,
            system_access: systemAccess,
            final_pay: finalPay ? { ...finalPay, payroll_reference, settlement_payslip } : null,
            clearance_documents: clearance,
            vacant_position: vacantPosition ?? null,
        };
    }
    async acceptRejectCase(caseId, action, hrUserId, rejectionReason, templateId) {
        const supabase = this.supabaseService.getClient();
        const { data: c } = await supabase
            .from('offboarding_cases').select('*').eq('case_id', caseId).maybeSingle();
        if (!c)
            throw new common_1.NotFoundException('Case not found.');
        if (String(c.employee_id ?? '') === hrUserId) {
            throw new common_1.ForbiddenException('You cannot review your own resignation request.');
        }
        if (c.status !== 'Submitted' && c.status !== 'Manager_Acknowledged') {
            throw new common_1.BadRequestException('Case must be in Submitted or Manager_Acknowledged status to accept/reject.');
        }
        if (action === 'Rejected' && !rejectionReason) {
            throw new common_1.BadRequestException('rejection_reason is required when rejecting a case.');
        }
        const newStatus = action === 'Accepted' ? 'HR_Accepted' : 'Rejected';
        const { error } = await supabase
            .from('offboarding_cases')
            .update({ status: newStatus, updated_at: new Date().toISOString(),
            ...(action === 'Accepted' && templateId ? { selected_template_id: templateId } : {}),
            ...(action === 'Rejected' ? { rejection_reason: rejectionReason } : {}) })
            .eq('case_id', caseId);
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'acceptRejectCase', this.logger);
        }
        const { data: emp } = await supabase
            .from('user_profile').select('company_id, email, first_name, last_name, role_id').eq('user_id', c.employee_id).maybeSingle();
        const companyId = emp?.company_id ?? '';
        const employeeRoleId = String(emp?.role_id ?? '').trim();
        const employeeRoleName = employeeRoleId.length > 0
            ? await supabase
                .from('role')
                .select('role_name')
                .eq('role_id', employeeRoleId)
                .maybeSingle()
                .then((result) => String(result.data?.role_name ?? '').trim())
            : '';
        this.notificationsService.createNotification({
            userId: c.employee_id,
            companyId,
            type: action === 'Accepted' ? 'OFFBOARDING_ACCEPTED' : 'OFFBOARDING_REJECTED',
            title: action === 'Accepted' ? 'Resignation Accepted' : 'Resignation Rejected',
            message: action === 'Accepted'
                ? 'Your resignation has been formally accepted. Your offboarding checklist is now available.'
                : `Your resignation has been rejected. Reason: ${rejectionReason}`,
            metadata: { case_id: caseId },
        }).catch(err => this.logger.error('Notification failed in acceptRejectCase', err));
        if (action === 'Accepted') {
            await this.generateChecklistFromTemplate(caseId, c.employee_id, companyId, c.offboarding_type, templateId ?? (String(c.selected_template_id ?? '').trim() || undefined), employeeRoleName || undefined);
            this.recomputeFinalPayFromCompensation(caseId).catch((err) => {
                this.logger.warn(`Final pay pre-computation skipped for case ${caseId}: ${err?.message ?? err}. ` +
                    `It will be computed when HR opens the final pay view.`);
            });
        }
        const auditAction = `OFFBOARDING_CASE_${action.toUpperCase()}: case ${caseId}`;
        const auditReason = action === 'Rejected' ? ` reason: ${rejectionReason}` : '';
        this.auditService.log(`${auditAction}${auditReason}`, hrUserId, companyId, c.employee_id).catch(err => this.logger.error('Audit failed in acceptRejectCase', err));
        this.logger.log(`Case ${caseId} ${action} by HR ${hrUserId}`);
        return { case_id: caseId, status: newStatus };
    }
    async generateChecklistFromTemplate(caseId, employeeId, companyId, offboardingType, selectedTemplateId, employeeRoleName) {
        const supabase = this.supabaseService.getClient();
        const { data: templates } = await supabase
            .from('offboarding_checklist_templates')
            .select('template_id, employee_type, applicable_offboarding_types, is_default, require_knowledge_transfer, system_access_to_revoke, created_at')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        const normalize = (value) => String(value ?? '').trim().toLowerCase();
        const parseTokens = (value) => String(value ?? '')
            .split(/[/,|]/)
            .map((entry) => entry.trim())
            .filter(Boolean);
        const normalizedOffboardingType = normalize(offboardingType);
        const normalizedEmployeeRole = normalize(employeeRoleName);
        const selectedTemplate = (templates ?? [])
            .filter((template) => {
            if (selectedTemplateId) {
                return String(template.template_id) === String(selectedTemplateId);
            }
            const explicitTypes = Array.isArray(template.applicable_offboarding_types)
                ? template.applicable_offboarding_types.map((value) => normalize(value)).filter(Boolean)
                : [];
            const scopedTokens = parseTokens(template.employee_type).map((value) => normalize(value));
            const typeMatches = explicitTypes.length > 0
                ? explicitTypes.includes(normalizedOffboardingType)
                : scopedTokens.length === 0 || scopedTokens.includes(normalizedOffboardingType);
            if (!typeMatches)
                return false;
            if (!normalizedEmployeeRole)
                return true;
            const roleTokens = scopedTokens.filter((token) => token !== normalizedOffboardingType);
            return roleTokens.length === 0 || roleTokens.includes(normalizedEmployeeRole);
        })
            .sort((left, right) => {
            if (selectedTemplateId) {
                return String(right.created_at ?? '').localeCompare(String(left.created_at ?? ''));
            }
            const leftTokens = parseTokens(left.employee_type).map((value) => normalize(value));
            const rightTokens = parseTokens(right.employee_type).map((value) => normalize(value));
            const leftRoleSpecific = normalizedEmployeeRole ? leftTokens.includes(normalizedEmployeeRole) : false;
            const rightRoleSpecific = normalizedEmployeeRole ? rightTokens.includes(normalizedEmployeeRole) : false;
            if (leftRoleSpecific !== rightRoleSpecific) {
                return leftRoleSpecific ? -1 : 1;
            }
            if (Boolean(left.is_default) !== Boolean(right.is_default)) {
                return left.is_default ? -1 : 1;
            }
            return String(right.created_at ?? '').localeCompare(String(left.created_at ?? ''));
        })[0] ?? null;
        if (!selectedTemplate) {
            this.logger.warn(`No checklist template found for company ${companyId}. Using defaults.`);
            const defaults = [
                { item_name: 'Return laptop/device', category: 'Asset' },
                { item_name: 'Return company ID / access card', category: 'Asset' },
                { item_name: 'Knowledge transfer documentation', category: 'Task' },
                { item_name: 'Clear personal files from company systems', category: 'Task' },
                { item_name: 'Return parking pass (if applicable)', category: 'Asset' },
            ];
            await supabase.from('checklist_items').insert(defaults.map(d => ({ case_id: caseId, item_name: d.item_name, status: 'Pending', category: d.category, is_custom: false })));
            await supabase
                .from('knowledge_transfer')
                .update({ status: 'Pending Manager Sign-Off' })
                .eq('case_id', caseId);
            await supabase
                .from('system_access')
                .delete()
                .eq('case_id', caseId);
            await supabase.from('system_access').insert(['Email', 'HRIS System', 'Timekeeping System'].map((systemName) => ({
                case_id: caseId,
                system_name: systemName,
            })));
            return;
        }
        const { data: templateItems } = await supabase
            .from('offboarding_checklist_template_items')
            .select('*')
            .eq('template_id', selectedTemplate.template_id);
        if (templateItems && templateItems.length > 0) {
            await supabase.from('checklist_items').insert(templateItems.map((ti) => ({
                case_id: caseId,
                item_name: ti.item_name,
                status: 'Pending',
                category: ti.category ?? null,
                is_custom: ti.is_custom ?? false,
            })));
        }
        await supabase
            .from('knowledge_transfer')
            .update({
            status: selectedTemplate.require_knowledge_transfer === false
                ? 'Not Required'
                : 'Pending Manager Sign-Off',
        })
            .eq('case_id', caseId);
        const configuredSystems = Array.isArray(selectedTemplate.system_access_to_revoke)
            ? selectedTemplate.system_access_to_revoke
                .map((value) => String(value).trim())
                .filter((value) => value.length > 0)
            : [];
        await supabase
            .from('system_access')
            .delete()
            .eq('case_id', caseId);
        const resolvedSystems = configuredSystems.length > 0
            ? configuredSystems
            : ['Email', 'HRIS System', 'Timekeeping System'];
        await supabase.from('system_access').insert(resolvedSystems.map((systemName) => ({
            case_id: caseId,
            system_name: systemName,
        })));
        this.notificationsService.createNotification({
            userId: employeeId, companyId,
            type: 'OFFBOARDING_CHECKLIST_ASSIGNED',
            title: 'Offboarding Checklist Assigned',
            message: 'Your offboarding checklist has been generated. Please complete all items before your last working day.',
            metadata: { case_id: caseId },
        }).catch(err => this.logger.error('Failed to notify employee of checklist', err));
    }
    async updateStatus(caseId, newStatus, user) {
        const supabase = this.supabaseService.getClient();
        const { data: c } = await supabase
            .from('offboarding_cases').select('*').eq('case_id', caseId).maybeSingle();
        if (!c)
            throw new common_1.NotFoundException('Case not found.');
        const order = ['Submitted', 'Manager_Acknowledged', 'HR_Accepted', 'Completed'];
        const currentIdx = order.indexOf(c.status);
        const newIdx = order.indexOf(newStatus);
        if (newIdx !== currentIdx + 1) {
            throw new common_1.BadRequestException(`Cannot transition from "${c.status}" to "${newStatus}". Must follow: ${order.join(' → ')}`);
        }
        const hrRoles = [
            'HR Officer',
            'HR Offboarding Officer/Coordinator',
            'Admin',
            'System Admin',
        ];
        const managerRoles = ['Manager', ...hrRoles];
        if (newStatus === 'Manager_Acknowledged' && !managerRoles.includes(user.role_name)) {
            throw new common_1.ForbiddenException('Only a Manager or HR can acknowledge the case.');
        }
        if (['HR_Accepted', 'Completed'].includes(newStatus) && !hrRoles.includes(user.role_name)) {
            throw new common_1.ForbiddenException('Only HR can set this status.');
        }
        if (newStatus === 'Completed') {
            await this.validateCompletionReadiness(caseId);
        }
        const { data: updated, error } = await supabase
            .from('offboarding_cases')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('case_id', caseId).select().single();
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'updateStatus', this.logger);
        }
        const { data: emp } = await supabase
            .from('user_profile').select('company_id').eq('user_id', c.employee_id).maybeSingle();
        const companyId = emp?.company_id ?? '';
        if (newStatus === 'Manager_Acknowledged') {
            this.notificationsService.notifyAllHRInCompany(companyId, {
                type: 'OFFBOARDING_MANAGER_ACKNOWLEDGED',
                title: 'Manager Acknowledged Offboarding',
                message: `The manager has acknowledged the offboarding case. Please formally process it.`,
                metadata: { case_id: caseId },
            }).catch(err => this.logger.error('Failed to notify HR in updateStatus', err));
        }
        if (newStatus === 'Completed') {
            await this.deactivateEmployee(c.employee_id, user.sub_userid, companyId, caseId);
        }
        this.notificationsService.createNotification({
            userId: c.employee_id, companyId,
            type: 'OFFBOARDING_STATUS_UPDATED',
            title: 'Offboarding Status Updated',
            message: `Your offboarding status has been updated to: ${newStatus}`,
            metadata: { case_id: caseId, status: newStatus },
        }).catch(err => this.logger.error('Notification failed in updateStatus', err));
        this.auditService.log(`OFFBOARDING_STATUS_UPDATED: case ${caseId} → ${newStatus}`, user.sub_userid, companyId, c.employee_id).catch(err => this.logger.error('Audit failed in updateStatus', err));
        this.logger.log(`Case ${caseId} → ${newStatus}`);
        return updated;
    }
    async validateCompletionReadiness(caseId) {
        const supabase = this.supabaseService.getClient();
        const issues = [];
        const { data: checklistItems } = await supabase
            .from('checklist_items').select('status').eq('case_id', caseId);
        const incomplete = (checklistItems ?? []).filter((i) => i.status !== 'Verified' && i.status !== 'Completed');
        if (incomplete.length > 0)
            issues.push(`${incomplete.length} checklist item(s) not yet verified`);
        const { data: kt } = await supabase
            .from('knowledge_transfer').select('status').eq('case_id', caseId).maybeSingle();
        if (kt && kt.status !== 'Signed Off')
            issues.push('Knowledge transfer not signed off');
        const { data: systems } = await supabase
            .from('system_access').select('status').eq('case_id', caseId);
        const active = (systems ?? []).filter((s) => s.status !== 'Revoked');
        if (active.length > 0)
            issues.push(`${active.length} system access record(s) not revoked`);
        const pay = await this.getLatestFinalPayRecord(caseId);
        if (!pay || !['Payment Released', 'Transfer Confirmed'].includes(pay.status)) {
            issues.push('Final pay not released');
        }
        if (issues.length > 0) {
            throw new common_1.BadRequestException(`Cannot complete case. Resolve these first: ${issues.join('; ')}.`);
        }
    }
    async deactivateEmployee(employeeId, performedBy, companyId, caseId) {
        const supabase = this.supabaseService.getClient();
        await supabase
            .from('user_profile')
            .update({ account_status: 'Inactive', offboarding_status: 'Ended', offboarded_at: new Date().toISOString() })
            .eq('user_id', employeeId);
        const { data: emp } = await supabase
            .from('user_profile')
            .select('first_name, last_name, department_id, email')
            .eq('user_id', employeeId).maybeSingle();
        await supabase.from('offboarding_vacant_positions').insert({
            case_id: caseId,
            employee_id: employeeId,
            department_id: emp?.department_id ?? null,
            company_id: companyId,
            status: 'Pending Review',
            created_at: new Date().toISOString(),
        });
        this.auditService.log(`OFFBOARDING_EMPLOYEE_DEACTIVATED: employee ${employeeId}`, performedBy, companyId, employeeId).catch(err => this.logger.error('Audit failed in deactivateEmployee', err));
        this.logger.log(`Employee ${employeeId} deactivated after offboarding completion`);
    }
    async triggerJobPosting(caseId, hrUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: c } = await supabase
            .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
        if (!c)
            throw new common_1.NotFoundException('Case not found.');
        const { data: emp } = await supabase
            .from('user_profile')
            .select('first_name, last_name, department_id, company_id')
            .eq('user_id', c.employee_id).maybeSingle();
        if (!emp)
            throw new common_1.NotFoundException('Employee profile not found.');
        const e = emp;
        let specificPositionTitle = null;
        const { data: latestCompletedSession } = await supabase
            .from('onboarding_sessions')
            .select('assigned_position')
            .eq('account_id', c.employee_id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (typeof latestCompletedSession?.assigned_position === 'string') {
            const assignedPosition = latestCompletedSession.assigned_position.trim();
            if (assignedPosition)
                specificPositionTitle = assignedPosition;
        }
        if (!specificPositionTitle) {
            const { data: latestSession } = await supabase
                .from('onboarding_sessions')
                .select('assigned_position')
                .eq('account_id', c.employee_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (typeof latestSession?.assigned_position === 'string') {
                const assignedPosition = latestSession.assigned_position.trim();
                if (assignedPosition)
                    specificPositionTitle = assignedPosition;
            }
        }
        const positionTitle = buildVacatedPositionTitle({
            specificPositionTitle,
            firstName: e.first_name,
            lastName: e.last_name,
        });
        const jobPostingId = crypto.randomUUID();
        const { error: jpErr } = await supabase.from('job_postings').insert({
            job_posting_id: jobPostingId,
            company_id: e.company_id,
            title: positionTitle,
            description: `Position vacated due to offboarding of ${e.first_name} ${e.last_name}.`,
            department_id: e.department_id ?? null,
            status: 'open',
            posted_at: new Date().toISOString(),
        });
        if (jpErr)
            throw new common_1.BadRequestException(jpErr.message);
        await supabase.from('offboarding_vacant_positions')
            .update({ status: 'Opened', job_posting_id: jobPostingId })
            .eq('case_id', caseId);
        this.notificationsService.notifyAllHRInCompany(e.company_id, {
            type: 'OFFBOARDING_POSITION_REOPENED',
            title: 'Vacant Position Re-Opened',
            message: `The position vacated by ${e.first_name} ${e.last_name} has been re-opened for recruitment.`,
            metadata: { case_id: caseId, job_posting_id: jobPostingId },
        }).catch(err => this.logger.error('Notification failed in triggerJobPosting', err));
        if (e.department_id) {
            const { data: managers } = await supabase
                .from('user_profile')
                .select('user_id, role:role_id(role_name)')
                .eq('company_id', e.company_id)
                .eq('department_id', e.department_id)
                .then(res => ({
                ...res,
                data: (res.data ?? []).filter((u) => u.role?.role_name === 'Manager'),
            }));
            if (managers && managers.length > 0) {
                await Promise.allSettled(managers.map(mgr => this.notificationsService.createNotification({
                    userId: mgr.user_id,
                    companyId: e.company_id,
                    type: 'OFFBOARDING_POSITION_REOPENED',
                    title: 'Vacant Position Re-Opened for Recruitment',
                    message: `The position vacated by ${e.first_name} ${e.last_name} in your team has been re-opened. The hiring process will begin shortly.`,
                    metadata: { case_id: caseId, job_posting_id: jobPostingId },
                }).catch(err => this.logger.error('Failed to notify manager of re-opened position', err))));
            }
        }
        this.auditService.log(`OFFBOARDING_JOB_POSTING_TRIGGERED: case ${caseId} posting ${jobPostingId}`, hrUserId, e.company_id, c.employee_id).catch(err => this.logger.error('Audit failed in triggerJobPosting', err));
        return { message: 'Job posting created', job_posting_id: jobPostingId };
    }
    async getChecklist(caseId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('checklist_items').select('*').eq('case_id', caseId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async addChecklistItem(caseId, itemName) {
        if (!itemName?.trim())
            throw new common_1.BadRequestException('item_name is required.');
        const { data, error } = await this.supabaseService.getClient()
            .from('checklist_items')
            .insert({ case_id: caseId, item_name: itemName.trim(), status: 'Pending' })
            .select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async updateChecklistItem(itemId, status, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: item } = await supabase
            .from('checklist_items').select('item_id, case_id').eq('item_id', itemId).maybeSingle();
        if (!item)
            throw new common_1.NotFoundException('Checklist item not found.');
        const update = { status };
        if (status === 'Verified' || status === 'Completed') {
            update.cleared_by_id = userId;
            update.cleared_at = new Date().toISOString();
        }
        else if (status === 'Pending') {
            update.cleared_by_id = null;
            update.cleared_at = null;
        }
        const { data, error } = await supabase
            .from('checklist_items').update(update).eq('item_id', itemId).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (status === 'Verified') {
            const { data: allItems } = await supabase
                .from('checklist_items').select('status').eq('case_id', item.case_id);
            const allVerified = (allItems ?? []).every((i) => i.status === 'Verified' || i.status === 'Completed');
            if (allVerified) {
                const { data: c } = await supabase
                    .from('offboarding_cases').select('employee_id').eq('case_id', item.case_id).maybeSingle();
                if (c) {
                    const { data: emp } = await supabase
                        .from('user_profile').select('company_id').eq('user_id', c.employee_id).maybeSingle();
                    this.notificationsService.createNotification({
                        userId: c.employee_id,
                        companyId: emp?.company_id ?? '',
                        type: 'OFFBOARDING_CHECKLIST_COMPLETE',
                        title: 'Clearance Process Complete',
                        message: 'All your offboarding checklist items have been verified. Clearance confirmed.',
                        metadata: { case_id: item.case_id },
                    }).catch(err => this.logger.error('Failed to notify checklist complete', err));
                }
            }
        }
        this.auditService.log(`OFFBOARDING_CHECKLIST_ITEM_UPDATED: item ${itemId} → ${status}`, userId, '', '').catch(err => this.logger.error('Audit failed in updateChecklistItem', err));
        return data;
    }
    async acknowledgeAssetReturn(itemId, employeeId, proofUrl) {
        const supabase = this.supabaseService.getClient();
        const { data: item } = await supabase
            .from('checklist_items').select('item_id, case_id').eq('item_id', itemId).maybeSingle();
        if (!item)
            throw new common_1.NotFoundException('Checklist item not found.');
        const { data, error } = await supabase
            .from('checklist_items')
            .update({ status: 'Submitted' })
            .eq('item_id', itemId).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        this.auditService.log(`OFFBOARDING_ASSET_RETURN_ACKNOWLEDGED: item ${itemId}${proofUrl ? ' with proof' : ''}`, employeeId, '', '').catch(err => this.logger.error('Audit failed in acknowledgeAssetReturn', err));
        return data;
    }
    async listFinalPayRecords(caseId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('final_pay')
            .select('*')
            .eq('case_id', caseId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    pickCurrentFinalPay(rows) {
        if (!rows || rows.length === 0)
            return null;
        const statusRank = (status) => {
            switch (status) {
                case 'Transfer Confirmed':
                    return 4;
                case 'Payment Released':
                    return 3;
                case 'Ready for Review':
                    return 2;
                default:
                    return 1;
            }
        };
        return [...rows].sort((a, b) => {
            const byStatus = statusRank(b.status) - statusRank(a.status);
            if (byStatus !== 0)
                return byStatus;
            const aConfirmed = a.transfer_confirmed_at ? 1 : 0;
            const bConfirmed = b.transfer_confirmed_at ? 1 : 0;
            return bConfirmed - aConfirmed;
        })[0];
    }
    async getLatestFinalPayRecord(caseId) {
        const rows = await this.listFinalPayRecords(caseId);
        return this.pickCurrentFinalPay(rows);
    }
    async getKnowledgeTransfer(caseId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('knowledge_transfer').select('*').eq('case_id', caseId).maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async updateKnowledgeTransfer(caseId, dto, userId) {
        const supabase = this.supabaseService.getClient();
        const update = {};
        if (dto.transfer_notes !== undefined)
            update.transfer_notes = dto.transfer_notes;
        if (dto.action === 'sign_off') {
            update.status = 'Signed Off';
            update.signed_off_by_id = userId;
            update.signed_off_at = new Date().toISOString();
        }
        if (Object.keys(update).length === 0) {
            throw new common_1.BadRequestException('Nothing to update. Provide transfer_notes or action: sign_off.');
        }
        const { data, error } = await supabase
            .from('knowledge_transfer').update(update).eq('case_id', caseId).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (dto.action === 'sign_off') {
            const { data: c } = await supabase
                .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
            if (c) {
                const { data: emp } = await supabase
                    .from('user_profile').select('company_id').eq('user_id', c.employee_id).maybeSingle();
                this.notificationsService.notifyAllHRInCompany(emp?.company_id ?? '', {
                    type: 'OFFBOARDING_KT_SIGNED_OFF',
                    title: 'Knowledge Transfer Signed Off',
                    message: `Knowledge transfer for offboarding case ${caseId} has been signed off by manager.`,
                    metadata: { case_id: caseId },
                }).catch(err => this.logger.error('Failed to notify HR of KT sign-off', err));
                this.auditService.log(`OFFBOARDING_KT_SIGNED_OFF: case ${caseId}`, userId, emp?.company_id ?? '', c.employee_id).catch(err => this.logger.error('Audit failed in KT sign-off', err));
            }
        }
        return data;
    }
    async getSystemAccess(caseId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('system_access').select('*').eq('case_id', caseId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async addSystemAccess(caseId, systemName) {
        if (!systemName?.trim())
            throw new common_1.BadRequestException('system_name is required.');
        const { data, error } = await this.supabaseService.getClient()
            .from('system_access')
            .insert({ case_id: caseId, system_name: systemName.trim() })
            .select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async revokeSystemAccess(accessId, userId) {
        const supabase = this.supabaseService.getClient();
        const { data: row } = await supabase
            .from('system_access').select('access_id').eq('access_id', accessId).maybeSingle();
        if (!row)
            throw new common_1.NotFoundException('System access record not found.');
        const { data, error } = await supabase
            .from('system_access')
            .update({ status: 'Revoked', revoked_by_id: userId, revoked_at: new Date().toISOString() })
            .eq('access_id', accessId).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getFinalPay(caseId) {
        const supabase = this.supabaseService.getClient();
        const { data: caseRow } = await supabase
            .from('offboarding_cases')
            .select('employee_id, last_working_day')
            .eq('case_id', caseId)
            .maybeSingle();
        const { data: employee } = await supabase
            .from('user_profile')
            .select('company_id')
            .eq('user_id', caseRow?.employee_id ?? '')
            .maybeSingle();
        const data = await this.getLatestFinalPayRecord(caseId);
        if (!data) {
            return this.recomputeFinalPayFromCompensation(caseId);
        }
        const requiresRecompute = [data.salary_balance, data.leave_encashment, data.additional_pay, data.deductions, data.total_amount]
            .some((value) => value === null || value === undefined) ||
            (Number(data.salary_balance ?? 0) === 0 &&
                Number(data.leave_encashment ?? 0) === 0 &&
                Number(data.additional_pay ?? 0) === 0 &&
                Number(data.total_amount ?? 0) === 0 &&
                data.status !== 'Payment Released' &&
                data.status !== 'Transfer Confirmed');
        const resolved = !requiresRecompute ? data : await this.recomputeFinalPayFromCompensation(caseId);
        const payroll_reference = caseRow && employee
            ? await this.getLinkedPayrollReference(caseRow.employee_id, employee.company_id ?? '', caseRow.last_working_day ?? null)
            : null;
        const settlement_payslip = employee
            ? await this.getFinalSettlementPayslip(caseId, employee.company_id ?? '')
            : null;
        return {
            ...resolved,
            payroll_reference,
            settlement_payslip,
        };
    }
    async recomputeFinalPayManual(caseId) {
        this.logger.log(`Manual recompute triggered for final pay of case ${caseId}`);
        return this.recomputeFinalPayFromCompensation(caseId);
    }
    async updateFinalPay(caseId, dto) {
        const total = this.roundCurrency(Number(dto.salary_balance) +
            Number(dto.leave_encashment) +
            Number(dto.additional_pay) -
            Number(dto.deductions));
        const supabase = this.supabaseService.getClient();
        const payload = { ...dto, total_amount: total, status: 'Ready for Review' };
        const existingPay = await this.getLatestFinalPayRecord(caseId);
        let data = null;
        if (existingPay) {
            const { data: updatedRows, error } = await supabase
                .from('final_pay')
                .update(payload)
                .eq('case_id', caseId)
                .select();
            if (error)
                throw new common_1.BadRequestException(error.message);
            data = this.pickCurrentFinalPay(updatedRows);
        }
        else {
            const { data: inserted, error } = await supabase
                .from('final_pay')
                .insert({ case_id: caseId, ...payload })
                .select()
                .single();
            if (error)
                throw new common_1.BadRequestException(error.message);
            data = inserted;
        }
        const { data: caseRow } = await supabase
            .from('offboarding_cases')
            .select('employee_id, initiated_by_id, last_working_day')
            .eq('case_id', caseId)
            .maybeSingle();
        const { data: employee } = await supabase
            .from('user_profile')
            .select('company_id')
            .eq('user_id', caseRow?.employee_id ?? '')
            .maybeSingle();
        if (caseRow && employee && caseRow.last_working_day) {
            await this.syncFinalSettlementPayslip({
                caseId,
                companyId: employee.company_id ?? '',
                employeeId: caseRow.employee_id,
                actorId: caseRow.initiated_by_id ?? caseRow.employee_id,
                lastWorkingDay: caseRow.last_working_day,
                finalPay: {
                    salary_balance: Number(dto.salary_balance),
                    leave_encashment: Number(dto.leave_encashment),
                    additional_pay: Number(dto.additional_pay),
                    tax_deduction: 0,
                    statutory_deductions: 0,
                    deductions: Number(dto.deductions),
                    total_amount: total,
                    status: 'Ready for Review',
                },
            });
        }
        const { data: c } = await this.supabaseService.getClient()
            .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
        if (c) {
            const { data: emp } = await this.supabaseService.getClient()
                .from('user_profile').select('company_id').eq('user_id', c.employee_id).maybeSingle();
            this.notificationsService.createNotification({
                userId: c.employee_id,
                companyId: emp?.company_id ?? '',
                type: 'OFFBOARDING_FINAL_PAY_READY',
                title: 'Final Pay Ready for Review',
                message: 'Your final pay breakdown has been computed and is ready for review.',
                metadata: { case_id: caseId, total_amount: total },
            }).catch(err => this.logger.error('Failed to notify final pay ready', err));
        }
        return data;
    }
    async releaseFinalPay(caseId) {
        const supabase = this.supabaseService.getClient();
        const pay = await this.getLatestFinalPayRecord(caseId);
        if (!pay)
            throw new common_1.NotFoundException('Final pay record not found.');
        const { data: updatedRows, error } = await supabase
            .from('final_pay')
            .update({ status: 'Payment Released' })
            .eq('case_id', caseId)
            .select();
        if (error)
            throw new common_1.BadRequestException(error.message);
        const data = this.pickCurrentFinalPay(updatedRows);
        const { data: c } = await supabase
            .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
        if (c) {
            const { data: emp } = await supabase
                .from('user_profile').select('company_id').eq('user_id', c.employee_id).maybeSingle();
            const { data: caseRow } = await supabase
                .from('offboarding_cases')
                .select('initiated_by_id, last_working_day')
                .eq('case_id', caseId)
                .maybeSingle();
            await this.updateSettlementPayslipStatus(emp?.company_id ?? '', caseId, 'Final Pay');
            this.notificationsService.createNotification({
                userId: c.employee_id, companyId: emp?.company_id ?? '',
                type: 'OFFBOARDING_FINAL_PAY_RELEASED',
                title: 'Final Pay Released',
                message: 'Your final pay has been processed and released.',
                metadata: { case_id: caseId },
            }).catch(err => this.logger.error('Failed to notify final pay released', err));
        }
        this.logger.log(`Final pay released for case ${caseId}`);
        return data;
    }
    async recordPayTransferConfirmation(caseId, hrUserId) {
        const supabase = this.supabaseService.getClient();
        const pay = await this.getLatestFinalPayRecord(caseId);
        if (!pay)
            throw new common_1.NotFoundException('Final pay record not found.');
        const { data: c } = await supabase
            .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
        const { data: emp } = await supabase
            .from('user_profile').select('company_id').eq('user_id', c?.employee_id ?? '').maybeSingle();
        const confirmationPayload = {
            case_id: caseId,
            employee_id: c?.employee_id,
            company_id: emp?.company_id ?? '',
            total_amount: pay.total_amount,
            confirmed_by: hrUserId,
            confirmed_at: new Date().toISOString(),
            type: 'final_pay_offboarding',
        };
        const { data: existingLog, error: existingLogError } = await supabase
            .from('payroll_log')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('type', 'final_pay_offboarding')
            .maybeSingle();
        if (existingLogError)
            throw new common_1.BadRequestException(existingLogError.message);
        if (existingLog) {
            const { error: updateLogError } = await supabase
                .from('payroll_log')
                .update(confirmationPayload)
                .eq('case_id', caseId)
                .eq('type', 'final_pay_offboarding');
            if (updateLogError)
                throw new common_1.BadRequestException(updateLogError.message);
        }
        else {
            const { error: insertLogError } = await supabase.from('payroll_log').insert(confirmationPayload);
            if (insertLogError)
                throw new common_1.BadRequestException(insertLogError.message);
        }
        await supabase.from('final_pay')
            .update({ status: 'Transfer Confirmed', transfer_confirmed_at: new Date().toISOString() })
            .eq('case_id', caseId);
        const { data: caseRow } = await supabase
            .from('offboarding_cases')
            .select('last_working_day')
            .eq('case_id', caseId)
            .maybeSingle();
        await this.updateSettlementPayslipStatus(emp?.company_id ?? '', caseId, 'Transfer Confirmed');
        this.auditService.log(`OFFBOARDING_BANK_TRANSFER_CONFIRMED: case ${caseId}`, hrUserId, emp?.company_id ?? '', c?.employee_id ?? '').catch(err => this.logger.error('Audit failed in recordPayTransferConfirmation', err));
        return { message: 'Bank transfer confirmation recorded', case_id: caseId };
    }
    async getClearanceDocuments(caseId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('clearance_documents').select('*').eq('case_id', caseId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async releaseClearanceDocuments(caseId, hrUserId, notes) {
        const supabase = this.supabaseService.getClient();
        const { data: checklistItems } = await supabase
            .from('checklist_items').select('status').eq('case_id', caseId);
        const notVerified = (checklistItems ?? []).filter((i) => i.status !== 'Verified' && i.status !== 'Completed');
        if (notVerified.length > 0) {
            throw new common_1.BadRequestException(`Cannot release clearance documents. ${notVerified.length} checklist item(s) not yet verified.`);
        }
        const { data: c } = await supabase
            .from('offboarding_cases').select('employee_id').eq('case_id', caseId).maybeSingle();
        const { data: emp } = await supabase
            .from('user_profile').select('first_name, last_name, company_id').eq('user_id', c?.employee_id ?? '').maybeSingle();
        const docId = crypto.randomUUID();
        const { data: doc, error: docErr } = await supabase.from('clearance_documents').insert({
            document_id: docId,
            case_id: caseId,
            document_type: 'clearance_certificate',
            document_name: `Clearance Certificate - ${emp?.first_name} ${emp?.last_name}`,
            status: 'Released',
            released_by: hrUserId,
            released_at: new Date().toISOString(),
            notes: notes ?? null,
        }).select().single();
        if (docErr)
            throw new common_1.BadRequestException(docErr.message);
        this.notificationsService.createNotification({
            userId: c?.employee_id ?? '',
            companyId: emp?.company_id ?? '',
            type: 'OFFBOARDING_CLEARANCE_RELEASED',
            title: 'Clearance Documents Released',
            message: 'Your clearance documents are now available for download.',
            metadata: { case_id: caseId, document_id: docId },
        }).catch(err => this.logger.error('Failed to notify clearance release', err));
        this.auditService.log(`OFFBOARDING_CLEARANCE_RELEASED: case ${caseId}`, hrUserId, emp?.company_id ?? '', c?.employee_id ?? '').catch(err => this.logger.error('Audit failed in releaseClearanceDocuments', err));
        return doc;
    }
};
exports.OffboardingService = OffboardingService;
exports.OffboardingService = OffboardingService = OffboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        cnb_service_1.CnbService,
        cnb_encryption_service_1.CnbEncryptionService])
], OffboardingService);
//# sourceMappingURL=offboarding.service.js.map