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
var CnbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CnbService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
const common_2 = require("../../../../libs/common/src");
const cnb_encryption_service_1 = require("./cnb-encryption.service");
const DEFAULT_PAYROLL_SETTINGS = {
    working_days_per_year: 260,
    overtime_multiplier: 1.25,
    late_deduction_per_hour: 50,
    night_shift_diff_multiplier: 1.1,
};
let CnbService = CnbService_1 = class CnbService {
    supabaseService;
    encryption;
    logger = new common_1.Logger(CnbService_1.name);
    constructor(supabaseService, encryption) {
        this.supabaseService = supabaseService;
        this.encryption = encryption;
    }
    roundCurrency(value) {
        return Math.round(value * 100) / 100;
    }
    parseIsoDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException(`Invalid date value: ${value}`);
        }
        return date;
    }
    normalizeBenefitType(value) {
        const trimmed = value.trim();
        const normalized = trimmed.toLowerCase();
        const aliases = {
            allowance: 'allowance',
            incentive: 'incentive',
            'one-time incentive': 'one_time_incentive',
            'one time incentive': 'one_time_incentive',
            one_time_incentive: 'one_time_incentive',
            '13th month pay': '13th_month',
            '13th_month': '13th_month',
            retirement: 'retirement',
            'retirement benefit': 'retirement',
        };
        return aliases[normalized] ?? trimmed;
    }
    isMissingColumnError(error, column) {
        const message = String(error?.message ?? '').toLowerCase();
        return message.includes(column.toLowerCase()) && message.includes('column');
    }
    toDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    formatPayslipCode(input) {
        const referenceDate = input.payoutDate ?? input.createdAt ?? new Date().toISOString();
        const dateKey = this.toDateKey(this.parseIsoDate(referenceDate)).replaceAll('-', '');
        const suffix = input.payslipId.replaceAll('-', '').slice(-6).toUpperCase();
        return `PS-${dateKey}-${suffix}`;
    }
    async getCompanyHolidayMap(companyId, startDate, endDate) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('company_holidays')
            .select('holiday_date, pay_multiplier, allow_time_logs')
            .eq('company_id', companyId)
            .gte('holiday_date', startDate)
            .lte('holiday_date', endDate);
        if (error) {
            const message = String(error.message ?? '').toLowerCase();
            if (message.includes('company_holidays') && message.includes('does not exist')) {
                return new Map();
            }
            throw new common_1.BadRequestException(error.message);
        }
        return new Map((data ?? []).map((row) => [row.holiday_date, row]));
    }
    maxDateKey(left, right) {
        return left > right ? left : right;
    }
    buildUtcDate(year, monthIndex, day) {
        return new Date(Date.UTC(year, monthIndex, day));
    }
    getMonthEndKey(year, monthIndex) {
        return this.toDateKey(this.buildUtcDate(year, monthIndex + 1, 0));
    }
    isWeekday(date) {
        const day = date.getUTCDay();
        return day >= 1 && day <= 5;
    }
    listWeekdayKeys(startDate, endDate) {
        const start = this.parseIsoDate(`${startDate}T00:00:00.000Z`);
        const end = this.parseIsoDate(`${endDate}T00:00:00.000Z`);
        const keys = [];
        for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
            if (this.isWeekday(cursor)) {
                keys.push(this.toDateKey(cursor));
            }
        }
        return keys;
    }
    countWeekdaysInMonth(referenceDate) {
        const base = this.parseIsoDate(`${referenceDate}T00:00:00.000Z`);
        const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
        const end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0));
        return this.listWeekdayKeys(this.toDateKey(start), this.toDateKey(end)).length || 22;
    }
    normalizePositiveNumber(value, fallback, minimum) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < minimum) {
            return fallback;
        }
        return parsed;
    }
    normalizePayrollSettings(raw) {
        const input = raw && typeof raw === 'object' && !Array.isArray(raw)
            ? raw
            : {};
        return {
            working_days_per_year: Math.round(this.normalizePositiveNumber(input.working_days_per_year, DEFAULT_PAYROLL_SETTINGS.working_days_per_year, 1)),
            overtime_multiplier: this.normalizePositiveNumber(input.overtime_multiplier, DEFAULT_PAYROLL_SETTINGS.overtime_multiplier, 1),
            late_deduction_per_hour: this.normalizePositiveNumber(input.late_deduction_per_hour, DEFAULT_PAYROLL_SETTINGS.late_deduction_per_hour, 0),
            night_shift_diff_multiplier: this.normalizePositiveNumber(input.night_shift_diff_multiplier, DEFAULT_PAYROLL_SETTINGS.night_shift_diff_multiplier, 1),
        };
    }
    async getPayrollSettings(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('tenant_config')
            .select('payroll_settings')
            .eq('company_id', companyId)
            .maybeSingle();
        if (error) {
            if (this.isMissingColumnError(error, 'payroll_settings')) {
                return DEFAULT_PAYROLL_SETTINGS;
            }
            throw new common_1.BadRequestException(error.message);
        }
        return this.normalizePayrollSettings(data?.payroll_settings);
    }
    parseScheduleMoment(dateKey, timeValue) {
        return this.parseIsoDate(`${dateKey}T${timeValue}.000Z`);
    }
    buildScheduleRange(dateKey, schedule) {
        const start = this.parseScheduleMoment(dateKey, schedule.start_time);
        const end = this.parseScheduleMoment(dateKey, schedule.end_time);
        if (schedule.is_nightshift && end <= start) {
            end.setUTCDate(end.getUTCDate() + 1);
        }
        return { start, end };
    }
    diffHours(start, end) {
        return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
    }
    normalizePayFrequency(payFrequency) {
        const normalized = String(payFrequency ?? '').trim().toLowerCase();
        if (normalized === 'daily')
            return 'daily';
        if (normalized === 'weekly')
            return 'weekly';
        if (normalized === 'monthly')
            return 'monthly';
        return 'semi-monthly';
    }
    toMonthlyEquivalent(basicSalary, payFrequency) {
        const normalized = this.normalizePayFrequency(payFrequency);
        if (normalized === 'daily')
            return basicSalary * 22;
        if (normalized === 'weekly')
            return basicSalary * 52 / 12;
        if (normalized === 'semi-monthly')
            return basicSalary * 2;
        return basicSalary;
    }
    detectUnpaidLeave(leaveType) {
        const normalized = String(leaveType ?? '').trim().toLowerCase();
        return normalized.includes('unpaid') || normalized.includes('lwop');
    }
    getSemiMonthlyFirstEligiblePayoutDate(startDate) {
        const start = this.parseIsoDate(`${startDate}T00:00:00.000Z`);
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const base = this.buildUtcDate(start.getUTCFullYear(), start.getUTCMonth() + monthOffset, 1);
            const year = base.getUTCFullYear();
            const month = base.getUTCMonth();
            const fifteenthKey = this.toDateKey(this.buildUtcDate(year, month, 15));
            if (fifteenthKey >= startDate) {
                const priorCutoffEndKey = this.getMonthEndKey(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
                if (startDate < priorCutoffEndKey) {
                    return fifteenthKey;
                }
            }
            const monthEndKey = this.getMonthEndKey(year, month);
            if (monthEndKey >= startDate) {
                const priorCutoffEndKey = this.toDateKey(this.buildUtcDate(year, month, 15));
                if (startDate < priorCutoffEndKey) {
                    return monthEndKey;
                }
            }
        }
        return startDate;
    }
    getMonthlyFirstEligiblePayoutDate(startDate) {
        const start = this.parseIsoDate(`${startDate}T00:00:00.000Z`);
        for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
            const base = this.buildUtcDate(start.getUTCFullYear(), start.getUTCMonth() + monthOffset, 1);
            const year = base.getUTCFullYear();
            const month = base.getUTCMonth();
            const monthEndKey = this.getMonthEndKey(year, month);
            if (monthEndKey < startDate)
                continue;
            const cutoffCheckpointKey = this.toDateKey(this.buildUtcDate(year, month, 15));
            if (startDate < cutoffCheckpointKey) {
                return monthEndKey;
            }
        }
        return startDate;
    }
    getFirstEligiblePayoutDate(payFrequency, startDate) {
        if (payFrequency === 'monthly') {
            return this.getMonthlyFirstEligiblePayoutDate(startDate);
        }
        if (payFrequency === 'semi-monthly') {
            return this.getSemiMonthlyFirstEligiblePayoutDate(startDate);
        }
        return startDate;
    }
    async writeAudit(input) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.from('cnb_audit_trail').insert({
            audit_id: crypto.randomUUID(),
            company_id: input.companyId,
            actor_id: input.actorId,
            action_type: input.actionType,
            target_table: input.targetTable,
            target_record_id: input.targetRecordId,
            old_value: input.oldValue ? JSON.stringify(input.oldValue) : null,
            new_value: input.newValue ? JSON.stringify(input.newValue) : null,
            timestamp: new Date().toISOString(),
        });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'writeAudit', this.logger);
        }
    }
    async resolvePayrollCoverageWindow(userId, companyId, payFrequency, cutoffStartDate, cutoffEndDate, payoutDate, currentPeriodId) {
        const supabase = this.supabaseService.getClient();
        const { data: profile, error: profileError } = await supabase
            .from('user_profile')
            .select('start_date')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (profileError) {
            throw new common_1.BadRequestException(profileError.message);
        }
        const startDate = profile?.start_date
            ? String(profile.start_date).slice(0, 10)
            : null;
        if (!startDate) {
            return { startDate: cutoffStartDate, isFirstPayroll: false };
        }
        if (startDate > cutoffEndDate) {
            throw new common_1.BadRequestException(`Employee starts on ${startDate}, which is after this cutoff period.`);
        }
        const firstEligiblePayoutDate = this.getFirstEligiblePayoutDate(payFrequency, startDate);
        if (payoutDate < firstEligiblePayoutDate) {
            throw new common_1.BadRequestException(`Employee is not yet eligible for the ${payoutDate} payout under ${payFrequency} first-pay rules. First eligible payout is ${firstEligiblePayoutDate}.`);
        }
        const { count, error: priorPayslipError } = await supabase
            .from('cnb_payslips')
            .select('payslip_id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .neq('period_id', currentPeriodId);
        if (priorPayslipError) {
            throw new common_1.BadRequestException(priorPayslipError.message);
        }
        const isFirstPayroll = (count ?? 0) === 0;
        return {
            startDate: isFirstPayroll
                ? startDate
                : this.maxDateKey(cutoffStartDate, startDate),
            isFirstPayroll,
        };
    }
    async getSalaryBaseline(userId, companyId, asOfDate) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('cnb_salary_baselines')
            .select('*')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .order('effective_date', { ascending: false })
            .limit(1);
        if (asOfDate) {
            query = query.lte('effective_date', asOfDate);
        }
        const { data, error } = await query.maybeSingle();
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getSalaryBaseline', this.logger);
        }
        if (!data)
            return null;
        return {
            ...data,
            basic_salary: this.encryption.decrypt(String(data.basic_salary)),
        };
    }
    async getAllSalaryBaselines(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data: baselines, error: baselineErr } = await supabase
            .from('cnb_salary_baselines')
            .select('baseline_id, user_id, basic_salary, pay_frequency, effective_date, created_at')
            .eq('company_id', companyId)
            .order('effective_date', { ascending: false });
        if (baselineErr) {
            common_2.DatabaseErrorHandler.handle(baselineErr, 'getAllSalaryBaselines', this.logger);
        }
        const latestByUser = new Map();
        for (const row of baselines ?? []) {
            if (!latestByUser.has(row.user_id)) {
                latestByUser.set(row.user_id, row);
            }
        }
        const userIds = [...latestByUser.keys()];
        if (!userIds.length)
            return [];
        const { data: profiles } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, first_name, last_name')
            .in('user_id', userIds)
            .eq('company_id', companyId);
        const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
        return [...latestByUser.values()].map((row) => {
            const profile = profileMap.get(row.user_id);
            return {
                baseline_id: row.baseline_id,
                user_id: row.user_id,
                employee_id: profile?.employee_id ?? null,
                first_name: profile?.first_name ?? null,
                last_name: profile?.last_name ?? null,
                basic_salary: this.encryption.decrypt(String(row.basic_salary)),
                pay_frequency: row.pay_frequency,
                effective_date: row.effective_date,
            };
        });
    }
    async setSalaryBaseline(dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_salary_baselines')
            .insert({
            ...dto,
            basic_salary: this.encryption.encryptNumber(dto.basic_salary),
        })
            .select('*')
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId: dto.company_id,
            actorId,
            actionType: 'SALARY_BASELINE_SET',
            targetTable: 'cnb_salary_baselines',
            targetRecordId: String(data?.baseline_id ?? data?.id ?? crypto.randomUUID()),
            newValue: data,
        });
        return data;
    }
    async setBulkSalaryBaselines(companyId, basicSalary, payFrequency, effectiveDate, employeeIds, onlyMissing, actorId) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('user_profile')
            .select('user_id, employee_id, first_name, last_name')
            .eq('company_id', companyId)
            .not('employee_id', 'is', null);
        if (employeeIds && employeeIds.length > 0) {
            query = query.in('employee_id', employeeIds);
        }
        const { data: employees, error: empErr } = await query;
        if (empErr)
            throw new common_1.BadRequestException(empErr.message);
        let targetEmployees = employees ?? [];
        if (onlyMissing && targetEmployees.length > 0) {
            const userIds = targetEmployees.map((e) => e.user_id);
            const { data: existing, error: existErr } = await supabase
                .from('cnb_salary_baselines')
                .select('user_id')
                .in('user_id', userIds)
                .eq('company_id', companyId)
                .lte('effective_date', effectiveDate);
            if (existErr)
                throw new common_1.BadRequestException(existErr.message);
            const existingUserIds = new Set((existing ?? []).map((e) => e.user_id));
            targetEmployees = targetEmployees.filter((e) => !existingUserIds.has(e.user_id));
        }
        if (targetEmployees.length === 0) {
            return {
                count: 0,
                message: 'No employees to update',
                results: [],
            };
        }
        const encryptedSalary = this.encryption.encryptNumber(basicSalary);
        const salaryData = targetEmployees.map((emp) => ({
            baseline_id: crypto.randomUUID(),
            user_id: emp.user_id,
            company_id: companyId,
            pay_frequency: payFrequency,
            basic_salary: encryptedSalary,
            effective_date: effectiveDate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }));
        const { data: results, error: insertErr } = await supabase
            .from('cnb_salary_baselines')
            .insert(salaryData)
            .select('*');
        if (insertErr)
            throw new common_1.BadRequestException(insertErr.message);
        if (actorId) {
            await this.writeAudit({
                companyId,
                actorId,
                actionType: 'SALARY_BASELINE_BULK_SET',
                targetTable: 'cnb_salary_baselines',
                targetRecordId: crypto.randomUUID(),
                newValue: {
                    count: results?.length ?? 0,
                    basic_salary: basicSalary,
                    pay_frequency: payFrequency,
                    effective_date: effectiveDate,
                    employees: targetEmployees.map((e) => ({
                        user_id: e.user_id,
                        employee_id: e.employee_id,
                        name: `${e.first_name} ${e.last_name}`,
                    })),
                },
            });
        }
        return {
            count: results?.length ?? 0,
            message: `Salary baselines set for ${results?.length ?? 0} employees`,
            results: targetEmployees.map((e) => ({
                user_id: e.user_id,
                employee_id: e.employee_id,
                name: `${e.first_name} ${e.last_name}`,
                status: 'success',
            })),
        };
    }
    async getBenefitsCatalog(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_benefits_catalog')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .order('benefit_name', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async createBenefit(dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_benefits_catalog')
            .insert({
            benefit_id: crypto.randomUUID(),
            ...dto,
            benefit_type: this.normalizeBenefitType(dto.benefit_type),
            updated_at: new Date().toISOString(),
        })
            .select('*')
            .single();
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'createBenefit', this.logger);
        }
        await this.writeAudit({
            companyId: dto.company_id,
            actorId,
            actionType: 'BENEFIT_CATALOG_CREATE',
            targetTable: 'cnb_benefits_catalog',
            targetRecordId: String(data?.benefit_id ?? crypto.randomUUID()),
            newValue: data,
        });
        return data;
    }
    async updateBenefitCatalogItem(companyId, benefitId, dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: before, error: beforeError } = await supabase
            .from('cnb_benefits_catalog')
            .select('*')
            .eq('benefit_id', benefitId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (beforeError) {
            common_2.DatabaseErrorHandler.handle(beforeError, 'updateBenefitCatalogItem.beforeLookup', this.logger);
        }
        if (!before)
            throw new common_1.NotFoundException('Benefit type not found.');
        const payload = {
            updated_at: new Date().toISOString(),
        };
        if (dto.benefit_name !== undefined) {
            payload.benefit_name = dto.benefit_name.trim();
        }
        if (dto.benefit_type !== undefined) {
            payload.benefit_type = this.normalizeBenefitType(dto.benefit_type);
        }
        if (dto.taxable !== undefined) {
            payload.taxable = dto.taxable;
        }
        if (dto.default_amount !== undefined) {
            payload.default_amount = dto.default_amount;
        }
        if (dto.is_active !== undefined) {
            payload.is_active = dto.is_active;
        }
        let { data, error } = await supabase
            .from('cnb_benefits_catalog')
            .update(payload)
            .eq('benefit_id', benefitId)
            .eq('company_id', companyId)
            .select('*')
            .single();
        if (error && 'default_amount' in payload && this.isMissingColumnError(error, 'default_amount')) {
            delete payload.default_amount;
            ({ data, error } = await supabase
                .from('cnb_benefits_catalog')
                .update(payload)
                .eq('benefit_id', benefitId)
                .eq('company_id', companyId)
                .select('*')
                .single());
        }
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'updateBenefitCatalogItem', this.logger);
        }
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'BENEFIT_CATALOG_UPDATE',
            targetTable: 'cnb_benefits_catalog',
            targetRecordId: benefitId,
            oldValue: before,
            newValue: data,
        });
        return data;
    }
    async getEmployeeBenefits(userId, companyId, asOfDate) {
        const supabase = this.supabaseService.getClient();
        let mappingQuery = supabase
            .from('cnb_employee_benefits')
            .select('mapping_id, user_id, benefit_id, amount, effective_date')
            .eq('user_id', userId)
            .order('effective_date', { ascending: false });
        if (asOfDate) {
            mappingQuery = mappingQuery.lte('effective_date', asOfDate);
        }
        const { data: mappings, error: mappingError } = await mappingQuery;
        if (mappingError)
            throw new common_1.BadRequestException(mappingError.message);
        const rows = mappings ?? [];
        if (!rows.length)
            return [];
        const benefitIds = rows.map((row) => row.benefit_id).filter(Boolean);
        const { data: catalogRows, error: catalogError } = await supabase
            .from('cnb_benefits_catalog')
            .select('benefit_id, benefit_name, benefit_type, taxable, company_id')
            .in('benefit_id', benefitIds)
            .eq('company_id', companyId);
        if (catalogError)
            throw new common_1.BadRequestException(catalogError.message);
        const catalogById = new Map((catalogRows ?? []).map((row) => [row.benefit_id, row]));
        const mapped = rows
            .filter((row) => catalogById.has(row.benefit_id))
            .map((row) => {
            const catalog = catalogById.get(row.benefit_id);
            return {
                ...row,
                amount: this.encryption.decrypt(String(row.amount)),
                benefit_name: catalog?.benefit_name ?? null,
                benefit_type: catalog?.benefit_type ?? null,
                taxable: catalog?.taxable ?? null,
            };
        });
        const has13th = mapped.some((b) => b.benefit_type === '13th_month');
        if (has13th) {
            const salary = await this.getSalaryBaseline(userId, companyId);
            if (salary) {
                const year = new Date().getFullYear();
                return mapped.map((b) => b.benefit_type === '13th_month'
                    ? { ...b, amount: String(this.thirteenthMonthFromSalary(salary, year)) }
                    : b);
            }
        }
        return mapped;
    }
    async assignBenefit(companyId, dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: catalog, error: catalogError } = await supabase
            .from('cnb_benefits_catalog')
            .select('benefit_id, company_id, default_amount')
            .eq('benefit_id', dto.benefit_id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (catalogError)
            throw new common_1.BadRequestException(catalogError.message);
        if (!catalog)
            throw new common_1.NotFoundException('Benefit type not found.');
        const resolvedAmount = dto.amount ?? Number(catalog.default_amount ?? 0);
        const { data, error } = await supabase
            .from('cnb_employee_benefits')
            .insert({
            ...dto,
            amount: this.encryption.encryptNumber(this.roundCurrency(resolvedAmount)),
        })
            .select('*')
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.recordBenefitHistory({
            mapping_id: data?.mapping_id,
            user_id: dto.user_id,
            benefit_id: dto.benefit_id,
            action: 'created',
            amount_after: this.roundCurrency(resolvedAmount),
            effective_date_after: dto.effective_date,
            changed_by: actorId,
            change_reason: 'Benefit assigned to employee',
        });
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'EMPLOYEE_BENEFIT_ASSIGN',
            targetTable: 'cnb_employee_benefits',
            targetRecordId: String(data?.mapping_id ?? crypto.randomUUID()),
            newValue: data,
        });
        return data;
    }
    async removeEmployeeBenefit(mappingId, companyId, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: mapping, error: mappingError } = await supabase
            .from('cnb_employee_benefits')
            .select('mapping_id, benefit_id, user_id, amount, effective_date')
            .eq('mapping_id', mappingId)
            .maybeSingle();
        if (mappingError)
            throw new common_1.BadRequestException(mappingError.message);
        if (!mapping)
            throw new common_1.NotFoundException('Employee benefit mapping not found.');
        const { data: catalog, error: catalogError } = await supabase
            .from('cnb_benefits_catalog')
            .select('benefit_id, company_id')
            .eq('benefit_id', mapping.benefit_id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (catalogError)
            throw new common_1.BadRequestException(catalogError.message);
        if (!catalog)
            throw new common_1.NotFoundException('Benefit not found for this company.');
        const { error } = await supabase
            .from('cnb_employee_benefits')
            .delete()
            .eq('mapping_id', mappingId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.recordBenefitHistory({
            mapping_id: mappingId,
            user_id: mapping.user_id,
            benefit_id: mapping.benefit_id,
            action: 'removed',
            amount_before: mapping.amount,
            effective_date_before: mapping.effective_date,
            changed_by: actorId,
            change_reason: 'Benefit removed from employee',
        });
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'EMPLOYEE_BENEFIT_REMOVE',
            targetTable: 'cnb_employee_benefits',
            targetRecordId: mappingId,
            oldValue: mapping,
        });
        return { mapping_id: mappingId, deleted: true };
    }
    async recordBenefitHistory(input) {
        try {
            const supabase = this.supabaseService.getClient();
            const { error } = await supabase
                .from('cnb_employee_benefit_history')
                .insert({
                history_id: crypto.randomUUID(),
                mapping_id: input.mapping_id ?? null,
                user_id: input.user_id,
                benefit_id: input.benefit_id,
                action: input.action,
                amount_before: input.amount_before ?? null,
                amount_after: input.amount_after ?? null,
                effective_date_before: input.effective_date_before ?? null,
                effective_date_after: input.effective_date_after ?? null,
                changed_by: input.changed_by,
                change_reason: input.change_reason ?? null,
                changed_at: new Date().toISOString(),
            });
            if (error) {
                this.logger.warn(`Benefit history not logged: ${error.message}`);
            }
        }
        catch {
        }
    }
    async getBenefitHistory(userId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase
                .from('cnb_employee_benefit_history')
                .select('*')
                .eq('user_id', userId)
                .order('changed_at', { ascending: false });
            if (error) {
                this.logger.warn(`getBenefitHistory: ${error.message}`);
                return [];
            }
            return data ?? [];
        }
        catch {
            return [];
        }
    }
    async getStatutoryIds(userId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_statutory_ids')
            .select('*')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            return null;
        return {
            ...data,
            tin_number: data.tin_number ? this.encryption.decrypt(data.tin_number) : null,
            sss_number: data.sss_number ? this.encryption.decrypt(data.sss_number) : null,
            philhealth_number: data.philhealth_number ? this.encryption.decrypt(data.philhealth_number) : null,
            pagibig_number: data.pagibig_number ? this.encryption.decrypt(data.pagibig_number) : null,
        };
    }
    async saveStatutoryIds(userId, companyId, dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: before, error: beforeError } = await supabase
            .from('cnb_statutory_ids')
            .select('*')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (beforeError)
            throw new common_1.BadRequestException(beforeError.message);
        const payload = {
            user_id: userId,
            company_id: companyId,
            tin_number: dto.tin_number ? this.encryption.encrypt(dto.tin_number) : null,
            sss_number: dto.sss_number ? this.encryption.encrypt(dto.sss_number) : null,
            philhealth_number: dto.philhealth_number ? this.encryption.encrypt(dto.philhealth_number) : null,
            pagibig_number: dto.pagibig_number ? this.encryption.encrypt(dto.pagibig_number) : null,
            updated_at: new Date().toISOString(),
        };
        const query = before
            ? supabase
                .from('cnb_statutory_ids')
                .update(payload)
                .eq('statutory_id', before.statutory_id)
            : supabase.from('cnb_statutory_ids').insert(payload);
        const { data, error } = await query.select('*').single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'STATUTORY_IDS_SAVE',
            targetTable: 'cnb_statutory_ids',
            targetRecordId: String(data?.statutory_id ?? `${userId}:${companyId}`),
            oldValue: before ?? null,
            newValue: data,
        });
        return data;
    }
    async getTaxBrackets(companyId, year) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('cnb_tax_brackets')
            .select('*')
            .eq('company_id', companyId)
            .order('effective_year', { ascending: true })
            .order('min_salary', { ascending: true });
        if (year) {
            query = query.eq('effective_year', year);
        }
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async createTaxBracket(companyId, dto, actorId) {
        if (dto.max_salary < dto.min_salary) {
            throw new common_1.BadRequestException('max_salary must be greater than or equal to min_salary.');
        }
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_tax_brackets')
            .insert({
            bracket_id: crypto.randomUUID(),
            company_id: companyId,
            ...dto,
        })
            .select('*')
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'TAX_BRACKET_CREATE',
            targetTable: 'cnb_tax_brackets',
            targetRecordId: String(data?.bracket_id ?? crypto.randomUUID()),
            newValue: data,
        });
        return data;
    }
    async deleteTaxBracket(bracketId, companyId, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: existing, error: findError } = await supabase
            .from('cnb_tax_brackets')
            .select('*')
            .eq('bracket_id', bracketId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!existing)
            throw new common_1.NotFoundException('Tax bracket not found.');
        const { error } = await supabase
            .from('cnb_tax_brackets')
            .delete()
            .eq('bracket_id', bracketId)
            .eq('company_id', companyId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'TAX_BRACKET_DELETE',
            targetTable: 'cnb_tax_brackets',
            targetRecordId: bracketId,
            oldValue: existing,
        });
        return { bracket_id: bracketId, deleted: true };
    }
    async reviewPayslip(payslipId, status, reviewerId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data: before, error: beforeError } = await supabase
            .from('cnb_payslips')
            .select('*')
            .eq('payslip_id', payslipId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (beforeError)
            throw new common_1.BadRequestException(beforeError.message);
        if (!before)
            throw new common_1.NotFoundException('Payslip not found.');
        const { data, error } = await supabase
            .from('cnb_payslips')
            .update({ status })
            .eq('payslip_id', payslipId)
            .eq('company_id', companyId)
            .select('*')
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId: reviewerId,
            actionType: 'PAYSLIP_REVIEW',
            targetTable: 'cnb_payslips',
            targetRecordId: payslipId,
            oldValue: before,
            newValue: status,
        });
        return data;
    }
    async getMyCompensation(userId, companyId) {
        const [salary, benefits, statutory] = await Promise.all([
            this.getSalaryBaseline(userId, companyId),
            this.getEmployeeBenefits(userId, companyId),
            this.getStatutoryIds(userId, companyId),
        ]);
        return { salary, benefits, statutory };
    }
    async getMyPayslips(userId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select(`*, period:period_id(period_id, cutoff_start_date, cutoff_end_date, payout_date, status)`)
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const [profileResult, companyResult, tenantConfigResult] = await Promise.all([
            supabase
                .from('user_profile')
                .select('user_id, first_name, last_name, employee_id, email')
                .eq('user_id', userId)
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('company')
                .select('company_id, company_name')
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('tenant_config')
                .select('branding_settings')
                .eq('company_id', companyId)
                .maybeSingle(),
        ]);
        if (profileResult.error)
            throw new common_1.BadRequestException(profileResult.error.message);
        if (companyResult.error)
            throw new common_1.BadRequestException(companyResult.error.message);
        if (tenantConfigResult.error &&
            !this.isMissingColumnError(tenantConfigResult.error, 'branding_settings')) {
            throw new common_1.BadRequestException(tenantConfigResult.error.message);
        }
        return (data ?? []).map((row) => {
            const decrypted = this.decryptPayslipRow(row);
            const branding = tenantConfigResult.data?.branding_settings ?? null;
            return {
                ...decrypted,
                payslip_code: this.formatPayslipCode({
                    payslipId: String(row.payslip_id),
                    payoutDate: row.period?.payout_date ?? null,
                    createdAt: row.created_at,
                }),
                employee: profileResult.data ?? null,
                company: companyResult.data
                    ? {
                        ...companyResult.data,
                        company_display_name: typeof branding?.company_display_name === 'string'
                            ? branding.company_display_name
                            : null,
                        company_logo_url: typeof branding?.company_logo_url === 'string'
                            ? branding.company_logo_url
                            : null,
                    }
                    : null,
                breakdown: decrypted.other_deductions
                    ? (() => {
                        try {
                            return JSON.parse(String(decrypted.other_deductions));
                        }
                        catch {
                            return null;
                        }
                    })()
                    : null,
            };
        });
    }
    async getPayslipDetail(payslipId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select(`*, period:period_id(period_id, cutoff_start_date, cutoff_end_date, payout_date, status)`)
            .eq('payslip_id', payslipId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Payslip not found.');
        const decrypted = this.decryptPayslipRow(data);
        const [benefits, profileResult, companyResult, tenantConfigResult] = await Promise.all([
            this.getEmployeeBenefits(data.user_id, companyId),
            supabase
                .from('user_profile')
                .select('user_id, first_name, last_name, employee_id, email')
                .eq('user_id', data.user_id)
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('company')
                .select('company_id, company_name')
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('tenant_config')
                .select('branding_settings')
                .eq('company_id', companyId)
                .maybeSingle(),
        ]);
        if (profileResult.error)
            throw new common_1.BadRequestException(profileResult.error.message);
        if (companyResult.error)
            throw new common_1.BadRequestException(companyResult.error.message);
        if (tenantConfigResult.error &&
            !this.isMissingColumnError(tenantConfigResult.error, 'branding_settings')) {
            throw new common_1.BadRequestException(tenantConfigResult.error.message);
        }
        let breakdown = null;
        if (decrypted.other_deductions) {
            try {
                breakdown = JSON.parse(String(decrypted.other_deductions));
            }
            catch { }
        }
        const branding = tenantConfigResult.data?.branding_settings ?? null;
        return {
            ...decrypted,
            payslip_code: this.formatPayslipCode({
                payslipId: String(data.payslip_id),
                payoutDate: data.period?.payout_date ?? null,
                createdAt: data.created_at,
            }),
            benefits,
            breakdown,
            employee: profileResult.data ?? null,
            company: companyResult.data
                ? {
                    ...companyResult.data,
                    company_display_name: typeof branding?.company_display_name === 'string'
                        ? branding.company_display_name
                        : null,
                    company_logo_url: typeof branding?.company_logo_url === 'string'
                        ? branding.company_logo_url
                        : null,
                }
                : null,
        };
    }
    async getPayslipDetailForUser(payslipId, requestor) {
        const data = await this.getPayslipDetail(payslipId, requestor.company_id);
        const record = data;
        const privilegedRoles = new Set([
            'Admin',
            'System Admin',
            'HR Officer',
            'HR Recruiter',
            'HR Interviewer',
            'HR Compensation and Benefits Officer',
        ]);
        if (record['user_id'] !== requestor.sub_userid && !privilegedRoles.has(requestor.role_name)) {
            throw new common_1.ForbiddenException('You can only access your own payslip details.');
        }
        return data;
    }
    decryptPayslipRow(row) {
        const monetaryFields = [
            'basic_pay_earned',
            'total_allowances',
            'gross_pay',
            'tax_deduction',
            'statutory_deductions',
            'total_deductions',
            'net_pay',
        ];
        const result = { ...row };
        for (const field of monetaryFields) {
            if (result[field] != null) {
                result[field] = this.encryption.decrypt(String(result[field]));
            }
        }
        return result;
    }
    buildPayslipBreakdown(snapshot, isFirstPayroll) {
        const unitRate = snapshot.attendance.payableDays > 0
            ? this.roundCurrency(snapshot.earnedBasicPay / snapshot.attendance.payableDays)
            : null;
        return {
            sss: snapshot.statutory.sss,
            philhealth: snapshot.statutory.philhealth,
            pagibig: snapshot.statutory.pagibig,
            attendance: snapshot.attendance,
            coveredPeriodStart: snapshot.coveredPeriodStart,
            coveredPeriodEnd: snapshot.coveredPeriodEnd,
            firstPayrollAccumulation: isFirstPayroll,
            payFrequency: snapshot.payFrequency,
            basicPay: {
                units: snapshot.attendance.payableDays,
                scheduledUnits: snapshot.attendance.scheduledDays,
                unitLabel: 'day(s)',
                rate: unitRate,
            },
            overtime: {
                hours: snapshot.attendance.overtimeHours,
                pay: snapshot.overtimePay,
                multiplier: snapshot.payrollSettings.overtime_multiplier,
            },
            nightShift: {
                hours: snapshot.attendance.nightShiftHours,
                pay: snapshot.nightShiftDifferentialPay,
                multiplier: snapshot.payrollSettings.night_shift_diff_multiplier,
            },
            holiday: {
                dates: snapshot.attendance.holidayWorkedDates,
                pay: snapshot.holidayPremiumPay,
            },
            lateness: {
                hours: snapshot.attendance.lateHours,
                deduction: snapshot.lateDeduction,
                rate: snapshot.payrollSettings.late_deduction_per_hour,
            },
            benefits: snapshot.regularBenefits.map((benefit) => ({
                name: benefit.benefit_name,
                type: benefit.benefit_type,
                amount: Number(benefit.amount),
            })),
            oneTimeBenefits: snapshot.oneTimeBenefits.map((benefit) => ({
                name: benefit.benefit_name,
                type: benefit.benefit_type,
                amount: Number(benefit.amount),
            })),
        };
    }
    computeMonthlyStatutoryDeductions(monthlyGross, deductionConfig) {
        const calculateDeduction = (config, gross) => {
            if (config.type === 'percentage') {
                return gross * (config.value / 100);
            }
            else {
                return config.value;
            }
        };
        const sss = calculateDeduction(deductionConfig.sss, monthlyGross);
        const philhealth = calculateDeduction(deductionConfig.philhealth, monthlyGross);
        const pagibig = calculateDeduction(deductionConfig.pagibig, monthlyGross);
        this.logger.debug(`[DeductionCalc] monthlyGross=${monthlyGross}, sss=${sss}, philhealth=${philhealth}, pagibig=${pagibig}, total=${sss + philhealth + pagibig}`, {
            config: deductionConfig,
        });
        return { sss, philhealth, pagibig, total: sss + philhealth + pagibig };
    }
    async getAttendanceAndLeaveSummary(userId, companyId, startDate, endDate) {
        const supabase = this.supabaseService.getClient();
        const scheduledDayKeys = this.listWeekdayKeys(startDate, endDate);
        const scheduledDaySet = new Set(scheduledDayKeys);
        const holidayMap = await this.getCompanyHolidayMap(companyId, startDate, endDate);
        const { data: profile, error: profileError } = await supabase
            .from('user_profile')
            .select('employee_id')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (profileError)
            throw new common_1.BadRequestException(profileError.message);
        const workedDayKeys = new Set();
        let overtimeHours = 0;
        let lateHours = 0;
        let nightShiftHours = 0;
        if (profile?.employee_id) {
            const { data: attendanceLogs, error: attendanceError } = await supabase
                .from('attendance_time_logs')
                .select('log_type, timestamp, log_status, clock_type, schedule_id')
                .eq('employee_id', profile.employee_id)
                .gte('timestamp', `${startDate}T00:00:00.000Z`)
                .lte('timestamp', `${endDate}T23:59:59.999Z`)
                .order('timestamp', { ascending: true });
            if (attendanceError)
                throw new common_1.BadRequestException(attendanceError.message);
            const scheduleIds = [
                ...new Set((attendanceLogs ?? [])
                    .map((log) => String(log.schedule_id ?? '').trim())
                    .filter((value) => value.length > 0)),
            ];
            const scheduleMap = new Map();
            if (scheduleIds.length > 0) {
                const { data: schedules, error: scheduleError } = await supabase
                    .from('schedules')
                    .select('sched_id, start_time, end_time, is_nightshift')
                    .in('sched_id', scheduleIds);
                if (scheduleError)
                    throw new common_1.BadRequestException(scheduleError.message);
                for (const schedule of schedules ?? []) {
                    scheduleMap.set(schedule.sched_id, schedule);
                }
            }
            let openTimeIn = null;
            for (const log of attendanceLogs ?? []) {
                if (log.log_status === 'REJECTED')
                    continue;
                if (log.log_type !== 'time-in' && log.log_type !== 'time-out')
                    continue;
                if (log.log_type === 'time-in') {
                    const dateKey = String(log.timestamp).split('T')[0];
                    if (scheduledDaySet.has(dateKey)) {
                        workedDayKeys.add(dateKey);
                    }
                    openTimeIn = {
                        timestamp: String(log.timestamp),
                        scheduleId: log.schedule_id ? String(log.schedule_id) : null,
                    };
                    continue;
                }
                if (!openTimeIn)
                    continue;
                const dateKey = openTimeIn.timestamp.split('T')[0];
                const schedule = scheduleMap.get(String(log.schedule_id ?? openTimeIn.scheduleId ?? ''));
                if (schedule && scheduledDaySet.has(dateKey)) {
                    const timeInAt = this.parseIsoDate(openTimeIn.timestamp);
                    const timeOutAt = this.parseIsoDate(String(log.timestamp));
                    const scheduleWindow = this.buildScheduleRange(dateKey, schedule);
                    if (timeInAt > scheduleWindow.start) {
                        lateHours += this.diffHours(scheduleWindow.start, timeInAt);
                    }
                    if (timeOutAt > scheduleWindow.end) {
                        overtimeHours += this.diffHours(scheduleWindow.end, timeOutAt);
                    }
                    if (schedule.is_nightshift) {
                        nightShiftHours += this.diffHours(timeInAt, timeOutAt);
                    }
                }
                openTimeIn = null;
            }
        }
        const { data: leaveRequests, error: leaveError } = await supabase
            .from('time_leave_requests')
            .select('leave_type, start_date, end_date')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .eq('status', 'Approved')
            .lte('start_date', endDate)
            .gte('end_date', startDate);
        if (leaveError)
            throw new common_1.BadRequestException(leaveError.message);
        const paidLeaveDayKeys = new Set();
        const unpaidLeaveDayKeys = new Set();
        for (const request of leaveRequests ?? []) {
            const overlapStart = request.start_date > startDate ? request.start_date : startDate;
            const overlapEnd = request.end_date < endDate ? request.end_date : endDate;
            for (const dateKey of this.listWeekdayKeys(overlapStart, overlapEnd)) {
                if (!scheduledDaySet.has(dateKey))
                    continue;
                if (this.detectUnpaidLeave(request.leave_type)) {
                    unpaidLeaveDayKeys.add(dateKey);
                }
                else {
                    paidLeaveDayKeys.add(dateKey);
                }
            }
        }
        const payableDayKeys = new Set([...workedDayKeys, ...paidLeaveDayKeys]);
        for (const dateKey of unpaidLeaveDayKeys) {
            payableDayKeys.delete(dateKey);
        }
        const holidayWorkedDates = [...workedDayKeys].filter((dateKey) => holidayMap.has(dateKey));
        return {
            scheduledDays: scheduledDayKeys.length,
            workedDays: workedDayKeys.size,
            paidLeaveDays: paidLeaveDayKeys.size,
            unpaidLeaveDays: unpaidLeaveDayKeys.size,
            payableDays: Math.min(payableDayKeys.size, scheduledDayKeys.length),
            overtimeHours: this.roundCurrency(overtimeHours),
            lateHours: this.roundCurrency(lateHours),
            nightShiftHours: this.roundCurrency(nightShiftHours),
            workedDateKeys: [...workedDayKeys],
            holidayWorkedDates,
        };
    }
    async getBenefitDefaults(companyId) {
        const defaults = await this.getStatutoryDeductionDefaults(companyId);
        return {
            company_id: companyId,
            sss: defaults.sss,
            philhealth: defaults.philhealth,
            pagibig: defaults.pagibig,
            sss_amount: defaults.sss.value,
            philhealth_amount: defaults.philhealth.value,
            pagibig_amount: defaults.pagibig.value,
            other_statutory_amount: 0,
            notes: defaults.notes,
            updated_at: defaults.updated_at,
        };
    }
    async setBenefitDefaults(companyId, dto, actorId) {
        const supabase = this.supabaseService.getClient();
        const updateData = {
            updated_at: new Date().toISOString(),
        };
        if (dto.sss) {
            updateData.sss_type = dto.sss.type;
            updateData.sss_value = Number(dto.sss.value);
        }
        if (dto.philhealth) {
            updateData.philhealth_type = dto.philhealth.type;
            updateData.philhealth_value = Number(dto.philhealth.value);
        }
        if (dto.pagibig) {
            updateData.pagibig_type = dto.pagibig.type;
            updateData.pagibig_value = Number(dto.pagibig.value);
        }
        if (dto.notes !== undefined) {
            updateData.notes = dto.notes;
        }
        const { data: existing, error: selectError } = await supabase
            .from('cnb_statutory_deduction_defaults')
            .select('config_id')
            .eq('company_id', companyId)
            .maybeSingle();
        if (selectError) {
            common_2.DatabaseErrorHandler.handle(selectError, 'setBenefitDefaults.selectExisting', this.logger);
        }
        const payload = existing
            ? supabase
                .from('cnb_statutory_deduction_defaults')
                .update(updateData)
                .eq('company_id', companyId)
                .select('*')
                .single()
            : supabase
                .from('cnb_statutory_deduction_defaults')
                .insert({
                company_id: companyId,
                sss_type: dto.sss?.type ?? 'percentage',
                sss_value: dto.sss?.value ?? 4.5,
                philhealth_type: dto.philhealth?.type ?? 'percentage',
                philhealth_value: dto.philhealth?.value ?? 2.5,
                pagibig_type: dto.pagibig?.type ?? 'percentage',
                pagibig_value: dto.pagibig?.value ?? 2.0,
                notes: dto.notes ?? null,
                ...updateData,
            })
                .select('*')
                .single();
        const { data, error } = await payload;
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'setBenefitDefaults.upsert', this.logger);
        }
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'STATUTORY_DEFAULTS_SET',
            targetTable: 'cnb_statutory_deduction_defaults',
            targetRecordId: String(data?.config_id ?? crypto.randomUUID()),
            newValue: data,
        });
        return this.getBenefitDefaults(companyId);
    }
    async getStatutoryDeductionDefaults(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_statutory_deduction_defaults')
            .select('*')
            .eq('company_id', companyId)
            .maybeSingle();
        if (error) {
            this.logger.warn(`[StatutoryDefaults] fetch failed for ${companyId}: ${error.message}`);
        }
        const defaults = {
            sss: {
                type: data?.sss_type || 'percentage',
                value: data?.sss_value !== null && data?.sss_value !== undefined ? Number(data.sss_value) : 4.5,
            },
            philhealth: {
                type: data?.philhealth_type || 'percentage',
                value: data?.philhealth_value !== null && data?.philhealth_value !== undefined ? Number(data.philhealth_value) : 2.5,
            },
            pagibig: {
                type: data?.pagibig_type || 'percentage',
                value: data?.pagibig_value !== null && data?.pagibig_value !== undefined ? Number(data.pagibig_value) : 2.0,
            },
            notes: data?.notes ?? null,
            updated_at: data?.updated_at ?? null,
        };
        return defaults;
    }
    async buildCompensationSnapshot(userId, companyId, startDate, endDate, shared) {
        const [salary, benefits, brackets, attendance, deductionDefaults, payrollSettings, holidayMap] = await Promise.all([
            this.getSalaryBaseline(userId, companyId),
            this.getEmployeeBenefits(userId, companyId),
            shared?.brackets
                ? Promise.resolve(shared.brackets)
                : this.getTaxBrackets(companyId, new Date(endDate).getFullYear()),
            this.getAttendanceAndLeaveSummary(userId, companyId, startDate, endDate),
            shared?.deductionDefaults
                ? Promise.resolve(shared.deductionDefaults)
                : this.getStatutoryDeductionDefaults(companyId),
            this.getPayrollSettings(companyId),
            this.getCompanyHolidayMap(companyId, startDate, endDate),
        ]);
        if (!salary) {
            throw new common_1.BadRequestException(`No salary baseline found for user ${userId}.`);
        }
        const payFrequency = this.normalizePayFrequency(salary.pay_frequency);
        const periodYear = new Date(endDate).getFullYear();
        const regularBenefits = benefits.filter((benefit) => benefit.benefit_type !== 'one_time_incentive' &&
            benefit.benefit_type !== '13th_month');
        const oneTimeBenefits = benefits
            .filter((benefit) => benefit.benefit_type === 'one_time_incentive' ||
            benefit.benefit_type === '13th_month')
            .map((benefit) => {
            if (benefit.benefit_type === '13th_month') {
                return {
                    ...benefit,
                    amount: String(this.thirteenthMonthFromSalary(salary, periodYear)),
                };
            }
            return benefit;
        });
        const totalAllowances = regularBenefits.reduce((sum, benefit) => sum + Number(benefit.amount), 0);
        const additionalOneTimePay = oneTimeBenefits.reduce((sum, benefit) => sum + Number(benefit.amount), 0);
        const scheduledDays = Math.max(attendance.scheduledDays, 1);
        const monthlyBusinessDays = this.countWeekdaysInMonth(startDate);
        const periodSalary = Number(salary.basic_salary);
        const monthlyBasicEquivalent = this.toMonthlyEquivalent(periodSalary, payFrequency);
        const dailyRateFromAnnualizedMonthly = payrollSettings.working_days_per_year > 0
            ? (monthlyBasicEquivalent * 12) / payrollSettings.working_days_per_year
            : monthlyBasicEquivalent / monthlyBusinessDays;
        const fullPeriodBasic = payFrequency === 'daily'
            ? periodSalary * attendance.scheduledDays
            : payFrequency === 'weekly'
                ? (periodSalary / 5) * attendance.scheduledDays
                : payFrequency === 'monthly'
                    ? dailyRateFromAnnualizedMonthly * attendance.scheduledDays
                    : periodSalary;
        const attendanceFactor = attendance.scheduledDays > 0 && attendance.payableDays > 0
            ? Math.min(attendance.payableDays / scheduledDays, 1)
            : 1;
        const earnedBasicPay = fullPeriodBasic * attendanceFactor;
        const hourlyRate = attendance.scheduledDays > 0
            ? dailyRateFromAnnualizedMonthly / 8
            : monthlyBasicEquivalent / Math.max(monthlyBusinessDays * 8, 1);
        const baseDailyRate = payFrequency === 'daily'
            ? periodSalary
            : payFrequency === 'weekly'
                ? periodSalary / 5
                : dailyRateFromAnnualizedMonthly;
        const overtimePay = attendance.overtimeHours * hourlyRate * payrollSettings.overtime_multiplier;
        const nightShiftDifferentialPay = attendance.nightShiftHours *
            hourlyRate *
            Math.max(payrollSettings.night_shift_diff_multiplier - 1, 0);
        const holidayPremiumPay = attendance.holidayWorkedDates.reduce((sum, dateKey) => {
            const holiday = holidayMap.get(dateKey);
            const multiplier = Math.max(Number(holiday?.pay_multiplier ?? 2), 1);
            return sum + baseDailyRate * Math.max(multiplier - 1, 0);
        }, 0);
        const lateDeduction = attendance.lateHours * payrollSettings.late_deduction_per_hour;
        const grossPay = earnedBasicPay +
            totalAllowances +
            additionalOneTimePay +
            overtimePay +
            nightShiftDifferentialPay +
            holidayPremiumPay;
        const monthlyGrossEquivalent = monthlyBasicEquivalent +
            (payFrequency === 'semi-monthly'
                ? totalAllowances * 2
                : payFrequency === 'weekly'
                    ? totalAllowances * 52 / 12
                    : totalAllowances);
        const monthlyTax = this.computeIncomeTax(monthlyGrossEquivalent, brackets);
        const monthlyStatutory = this.computeMonthlyStatutoryDeductions(monthlyGrossEquivalent, deductionDefaults);
        const periodProportion = monthlyBasicEquivalent > 0
            ? Math.min(earnedBasicPay / monthlyBasicEquivalent, 1)
            : 1;
        this.logger.debug(`[PayslipComputation] Period calculation:`, {
            earnedBasicPay: this.roundCurrency(earnedBasicPay),
            monthlyBasicEquivalent,
            dailyRateFromAnnualizedMonthly: this.roundCurrency(dailyRateFromAnnualizedMonthly),
            periodProportion,
            attendance: {
                payableDays: attendance.payableDays,
                scheduledDays: attendance.scheduledDays,
                attendanceFactor,
                overtimeHours: attendance.overtimeHours,
                lateHours: attendance.lateHours,
                nightShiftHours: attendance.nightShiftHours,
            },
        });
        const taxForPeriod = monthlyTax * periodProportion;
        const statutory = {
            sss: monthlyStatutory.sss * periodProportion,
            philhealth: monthlyStatutory.philhealth * periodProportion,
            pagibig: monthlyStatutory.pagibig * periodProportion,
            total: monthlyStatutory.total * periodProportion,
        };
        const totalDeductions = taxForPeriod + statutory.total + lateDeduction;
        const netPay = grossPay - totalDeductions;
        return {
            salary,
            payFrequency,
            regularBenefits,
            oneTimeBenefits,
            attendance,
            monthlyBusinessDays,
            totalAllowances,
            additionalOneTimePay,
            monthlyBasicEquivalent,
            earnedBasicPay: this.roundCurrency(earnedBasicPay),
            grossPay: this.roundCurrency(grossPay),
            monthlyGrossEquivalent: this.roundCurrency(monthlyGrossEquivalent),
            taxForPeriod: this.roundCurrency(taxForPeriod),
            overtimePay: this.roundCurrency(overtimePay),
            nightShiftDifferentialPay: this.roundCurrency(nightShiftDifferentialPay),
            holidayPremiumPay: this.roundCurrency(holidayPremiumPay),
            lateDeduction: this.roundCurrency(lateDeduction),
            statutory: {
                sss: this.roundCurrency(statutory.sss),
                philhealth: this.roundCurrency(statutory.philhealth),
                pagibig: this.roundCurrency(statutory.pagibig),
                total: this.roundCurrency(statutory.total),
            },
            totalDeductions: this.roundCurrency(totalDeductions),
            netPay: this.roundCurrency(netPay),
            payrollSettings,
            deductionDefaults: {
                sss: deductionDefaults.sss,
                philhealth: deductionDefaults.philhealth,
                pagibig: deductionDefaults.pagibig,
            },
            coveredPeriodStart: startDate,
            coveredPeriodEnd: endDate,
        };
    }
    async computeOffboardingFinalPay(userId, companyId, lastWorkingDay) {
        const endDate = this.toDateKey(this.parseIsoDate(`${lastWorkingDay}T00:00:00.000Z`));
        const end = this.parseIsoDate(`${endDate}T00:00:00.000Z`);
        const start = end.getUTCDate() <= 15
            ? new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1))
            : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 16));
        const snapshot = await this.buildCompensationSnapshot(userId, companyId, this.toDateKey(start), endDate);
        const supabase = this.supabaseService.getClient();
        const { data: leaveBalances, error: leaveError } = await supabase
            .from('time_leave_balances')
            .select('leave_type, allocated_days, used_days')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .eq('year', end.getUTCFullYear());
        if (leaveError)
            throw new common_1.BadRequestException(leaveError.message);
        const dailyRate = snapshot.monthlyBasicEquivalent / 22;
        const remainingLeaveDays = (leaveBalances ?? []).reduce((sum, balance) => {
            const remaining = Number(balance.allocated_days) - Number(balance.used_days);
            return remaining > 0 ? sum + remaining : sum;
        }, 0);
        const leaveEncashment = this.roundCurrency(remainingLeaveDays * dailyRate);
        const additionalPay = this.roundCurrency(snapshot.totalAllowances + snapshot.additionalOneTimePay);
        const deductions = this.roundCurrency(snapshot.taxForPeriod + snapshot.statutory.total);
        const totalAmount = this.roundCurrency(snapshot.earnedBasicPay + leaveEncashment + additionalPay - deductions);
        return {
            salary_balance: snapshot.earnedBasicPay,
            leave_encashment: leaveEncashment,
            additional_pay: additionalPay,
            deductions,
            total_amount: totalAmount,
            breakdown: {
                covered_period_start: this.toDateKey(start),
                covered_period_end: endDate,
                attendance: snapshot.attendance,
                monthly_basic_equivalent: snapshot.monthlyBasicEquivalent,
                regular_benefits_total: this.roundCurrency(snapshot.totalAllowances),
                one_time_benefits_total: this.roundCurrency(snapshot.additionalOneTimePay),
                remaining_leave_days: this.roundCurrency(remainingLeaveDays),
                statutory: snapshot.statutory,
                tax: snapshot.taxForPeriod,
            },
        };
    }
    computeIncomeTax(monthlyGross, brackets) {
        if (!brackets.length)
            return 0;
        const sorted = [...brackets].sort((a, b) => a.min_salary - b.min_salary);
        const bracket = sorted.find((b) => monthlyGross >= Number(b.min_salary) &&
            monthlyGross <= Number(b.max_salary)) ?? (monthlyGross > Number(sorted[sorted.length - 1].max_salary)
            ? sorted[sorted.length - 1]
            : null);
        if (!bracket)
            return 0;
        const excess = Math.max(0, monthlyGross - Number(bracket.min_salary));
        return (Number(bracket.base_tax_amount) +
            (excess * Number(bracket.excess_percentage)) / 100);
    }
    async computeEmployeePayslip(userId, companyId, periodId, actorId, shared, preFetchedPeriod) {
        const supabase = this.supabaseService.getClient();
        let period = preFetchedPeriod;
        if (!period) {
            const { data, error: periodError } = await supabase
                .from('cnb_payroll_periods')
                .select('cutoff_start_date, cutoff_end_date, payout_date')
                .eq('period_id', periodId)
                .eq('company_id', companyId)
                .maybeSingle();
            if (periodError)
                throw new common_1.BadRequestException(periodError.message);
            if (!data)
                throw new common_1.NotFoundException('Payroll period not found.');
            period = data;
        }
        const salary = await this.getSalaryBaseline(userId, companyId, period.cutoff_end_date);
        if (!salary) {
            throw new common_1.BadRequestException(`No salary baseline found for user ${userId}.`);
        }
        const payFrequency = this.normalizePayFrequency(salary.pay_frequency);
        const coverage = await this.resolvePayrollCoverageWindow(userId, companyId, payFrequency, period.cutoff_start_date, period.cutoff_end_date, period.payout_date, periodId);
        const snapshot = await this.buildCompensationSnapshot(userId, companyId, coverage.startDate, period.cutoff_end_date, shared);
        const breakdown = this.buildPayslipBreakdown(snapshot, coverage.isFirstPayroll);
        const payslipData = {
            payslip_id: crypto.randomUUID(),
            period_id: periodId,
            user_id: userId,
            company_id: companyId,
            basic_pay_earned: this.encryption.encryptNumber(snapshot.earnedBasicPay),
            total_allowances: this.encryption.encryptNumber(this.roundCurrency(snapshot.totalAllowances)),
            gross_pay: this.encryption.encryptNumber(snapshot.grossPay),
            tax_deduction: this.encryption.encryptNumber(snapshot.taxForPeriod),
            statutory_deductions: this.encryption.encryptNumber(snapshot.statutory.total),
            other_deductions: JSON.stringify(breakdown),
            total_deductions: this.encryption.encryptNumber(snapshot.totalDeductions),
            net_pay: this.encryption.encryptNumber(snapshot.netPay),
            status: 'Pending Review',
            employee_ack_status: 'Pending',
        };
        const { data: existing } = await supabase
            .from('cnb_payslips')
            .select('payslip_id, status, employee_ack_status, acknowledged_at')
            .eq('user_id', userId)
            .eq('period_id', periodId)
            .maybeSingle();
        const preservedState = existing
            ? {
                status: existing.status ?? payslipData.status,
                employee_ack_status: existing.employee_ack_status ?? payslipData.employee_ack_status,
                acknowledged_at: existing.acknowledged_at ?? null,
            }
            : {};
        const upsertQuery = existing
            ? supabase
                .from('cnb_payslips')
                .update({ ...payslipData, ...preservedState })
                .eq('payslip_id', existing.payslip_id)
            : supabase.from('cnb_payslips').insert(payslipData);
        const { data: saved, error } = await upsertQuery.select('*').single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'PAYSLIP_COMPUTED',
            targetTable: 'cnb_payslips',
            targetRecordId: String(saved?.payslip_id ?? payslipData.payslip_id),
            newValue: {
                gross: snapshot.grossPay,
                tax: snapshot.taxForPeriod,
                net: snapshot.netPay,
                attendance: snapshot.attendance,
            },
        });
        return { ...saved, breakdown, benefits: snapshot.regularBenefits };
    }
    async runPayrollCutoff(companyId, cutoffStartDate, cutoffEndDate, payoutDate, actorId) {
        const supabase = this.supabaseService.getClient();
        const { data: existingPeriod } = await supabase
            .from('cnb_payroll_periods')
            .select('period_id')
            .eq('company_id', companyId)
            .eq('cutoff_start_date', cutoffStartDate)
            .eq('cutoff_end_date', cutoffEndDate)
            .maybeSingle();
        let periodId;
        if (existingPeriod) {
            periodId = existingPeriod.period_id;
        }
        else {
            const periodData = {
                period_id: crypto.randomUUID(),
                company_id: companyId,
                cutoff_start_date: cutoffStartDate,
                cutoff_end_date: cutoffEndDate,
                payout_date: payoutDate,
                status: 'Draft',
                processed_by: actorId,
                processed_at: new Date().toISOString(),
            };
            const { data: newPeriod, error: periodErr } = await supabase
                .from('cnb_payroll_periods')
                .insert(periodData)
                .select('period_id')
                .single();
            if (periodErr)
                throw new common_1.BadRequestException(periodErr.message);
            periodId = newPeriod.period_id;
        }
        const { data: employees, error: empErr } = await supabase
            .from('user_profile')
            .select('user_id, first_name, last_name, employee_id')
            .eq('company_id', companyId)
            .not('employee_id', 'is', null);
        if (empErr)
            throw new common_1.BadRequestException(empErr.message);
        const activeEmployees = employees ?? [];
        const periodYear = new Date(cutoffStartDate).getFullYear();
        const [sharedBrackets, sharedDeductionDefaults] = await Promise.all([
            this.getTaxBrackets(companyId, periodYear),
            this.getStatutoryDeductionDefaults(companyId),
        ]);
        const sharedPayrollData = { brackets: sharedBrackets, deductionDefaults: sharedDeductionDefaults };
        const preFetchedPeriod = {
            cutoff_start_date: cutoffStartDate,
            cutoff_end_date: cutoffEndDate,
            payout_date: payoutDate,
        };
        const outcomes = await Promise.allSettled(activeEmployees.map((emp) => this.computeEmployeePayslip(emp.user_id, companyId, periodId, actorId, sharedPayrollData, preFetchedPeriod)));
        const results = activeEmployees.map((emp, i) => {
            const outcome = outcomes[i];
            if (outcome.status === 'fulfilled') {
                return { user_id: emp.user_id, name: `${emp.first_name} ${emp.last_name}`, employee_id: emp.employee_id, payslip: outcome.value };
            }
            return { user_id: emp.user_id, name: `${emp.first_name} ${emp.last_name}`, employee_id: emp.employee_id, error: outcome.reason instanceof Error ? outcome.reason.message : 'Computation failed' };
        });
        return {
            period_id: periodId,
            cutoff_start_date: cutoffStartDate,
            cutoff_end_date: cutoffEndDate,
            payout_date: payoutDate,
            total_employees: activeEmployees.length,
            computed: results.filter((r) => !r.error).length,
            skipped: results.filter((r) => !!r.error).length,
            results,
        };
    }
    async getPayrollPeriods(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payroll_periods')
            .select('*')
            .eq('company_id', companyId)
            .order('cutoff_end_date', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async getPayslipsForPeriod(periodId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select('*')
            .eq('period_id', periodId)
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const rows = data ?? [];
        if (!rows.length)
            return [];
        const userIds = rows.map((r) => r.user_id);
        const { data: profiles } = await supabase
            .from('user_profile')
            .select('user_id, first_name, last_name, employee_id')
            .in('user_id', userIds);
        const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
        return rows.map((row) => {
            const decrypted = this.decryptPayslipRow(row);
            return {
                ...decrypted,
                employee: profileMap.get(row.user_id) ?? null,
                breakdown: decrypted.other_deductions
                    ? (() => {
                        try {
                            return JSON.parse(String(decrypted.other_deductions));
                        }
                        catch {
                            return null;
                        }
                    })()
                    : null,
            };
        });
    }
    thirteenthMonthFromSalary(salary, year) {
        const currentYear = new Date().getFullYear();
        const monthsEligible = year < currentYear ? 12 : new Date().getMonth() + 1;
        const perPeriod = Number(salary.basic_salary);
        const monthly = this.toMonthlyEquivalent(perPeriod, salary.pay_frequency);
        return Math.floor(((monthly * monthsEligible) / 12) * 100) / 100;
    }
    async compute13thMonthPay(userId, companyId, year) {
        const salary = await this.getSalaryBaseline(userId, companyId);
        if (!salary) {
            return {
                year,
                monthly_salary: 0,
                months_eligible: 0,
                thirteenth_month_pay: 0,
                note: 'No salary baseline found.',
            };
        }
        const currentYear = new Date().getFullYear();
        const monthsEligible = year < currentYear ? 12 : new Date().getMonth() + 1;
        const perPeriod = Number(salary.basic_salary);
        const monthly = this.toMonthlyEquivalent(perPeriod, salary.pay_frequency);
        const thirteenthMonthPay = this.thirteenthMonthFromSalary(salary, year);
        return {
            year,
            pay_frequency: salary.pay_frequency,
            monthly_salary: monthly,
            months_eligible: monthsEligible,
            thirteenth_month_pay: thirteenthMonthPay,
        };
    }
    async computeSalaryAnnualization(userId, companyId, annualRatePercent, years, startYear) {
        const salary = await this.getSalaryBaseline(userId, companyId);
        if (!salary) {
            return {
                pay_frequency: null,
                annual_rate_percent: annualRatePercent,
                years,
                schedule: [],
                note: 'No salary baseline found.',
            };
        }
        const frequency = this.normalizePayFrequency(salary.pay_frequency);
        const basePerPeriod = Number(salary.basic_salary);
        const start = startYear ?? new Date(salary.effective_date).getFullYear() ?? new Date().getFullYear();
        const growthFactor = 1 + annualRatePercent / 100;
        const schedule = Array.from({ length: Math.max(1, years) }, (_, index) => {
            const year = start + index;
            const perPeriod = this.roundCurrency(basePerPeriod * Math.pow(growthFactor, index));
            const monthlyEquivalent = this.roundCurrency(this.toMonthlyEquivalent(perPeriod, frequency));
            const annualEquivalent = this.roundCurrency(monthlyEquivalent * 12);
            return {
                year,
                pay_frequency: frequency,
                per_period_salary: perPeriod,
                monthly_equivalent: monthlyEquivalent,
                annual_equivalent: annualEquivalent,
            };
        });
        return {
            pay_frequency: frequency,
            annual_rate_percent: annualRatePercent,
            years,
            schedule,
        };
    }
    async getAnnualNetPay(userId, companyId, year) {
        const supabase = this.supabaseService.getClient();
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select(`
        payslip_id, net_pay, gross_pay, basic_pay_earned,
        total_allowances, total_deductions, tax_deduction,
        status, created_at,
        period:period_id(payout_date, cutoff_start_date, cutoff_end_date)
      `)
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .gte('created_at', `${startOfYear}T00:00:00.000Z`)
            .lte('created_at', `${endOfYear}T23:59:59.999Z`)
            .order('created_at', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const rows = data ?? [];
        const periods = rows.map((row) => ({
            payslip_id: row.payslip_id,
            payslip_code: this.formatPayslipCode({ payslipId: row.payslip_id, payoutDate: row.period?.payout_date, createdAt: row.created_at }),
            pay_period: row.period ? `${row.period.cutoff_start_date} → ${row.period.cutoff_end_date}` : '—',
            net_pay: this.roundCurrency(this.encryption.decryptToNumber(row.net_pay)),
            gross_pay: this.roundCurrency(this.encryption.decryptToNumber(row.gross_pay)),
            deductions: this.roundCurrency(this.encryption.decryptToNumber(row.total_deductions)),
            tax: this.roundCurrency(this.encryption.decryptToNumber(row.tax_deduction)),
            status: row.status,
            payout_date: row.period?.payout_date ?? null,
        }));
        const totalNetPay = this.roundCurrency(periods.reduce((s, p) => s + p.net_pay, 0));
        const totalGrossPay = this.roundCurrency(periods.reduce((s, p) => s + p.gross_pay, 0));
        const totalDeductions = this.roundCurrency(periods.reduce((s, p) => s + p.deductions, 0));
        const totalTax = this.roundCurrency(periods.reduce((s, p) => s + p.tax, 0));
        return {
            year,
            payslip_count: periods.length,
            total_net_pay: totalNetPay,
            total_gross_pay: totalGrossPay,
            total_deductions: totalDeductions,
            total_tax: totalTax,
            periods,
        };
    }
    async applyAnnualizationBatch(companyId, annualRatePercent, effectiveDate, actorId, employeeIds) {
        const supabase = this.supabaseService.getClient();
        let baselineQuery = supabase
            .from('cnb_salary_baselines')
            .select('baseline_id, user_id, basic_salary, pay_frequency, effective_date')
            .eq('company_id', companyId)
            .lte('effective_date', effectiveDate)
            .order('effective_date', { ascending: false });
        const { data: allBaselines, error: baselineErr } = await baselineQuery;
        if (baselineErr)
            throw new common_1.BadRequestException(baselineErr.message);
        const latestByUser = new Map();
        for (const row of allBaselines ?? []) {
            if (!latestByUser.has(row.user_id))
                latestByUser.set(row.user_id, row);
        }
        let targets = [...latestByUser.values()];
        if (employeeIds && employeeIds.length > 0) {
            const idSet = new Set(employeeIds);
            targets = targets.filter((t) => idSet.has(t.user_id));
        }
        if (targets.length === 0) {
            return { count: 0, message: 'No eligible employees found.', results: [] };
        }
        const growthFactor = 1 + annualRatePercent / 100;
        const insertRows = targets.map((row) => {
            const currentSalary = Number(this.encryption.decrypt(String(row.basic_salary)));
            const newSalary = this.roundCurrency(currentSalary * growthFactor);
            return {
                baseline_id: crypto.randomUUID(),
                user_id: row.user_id,
                company_id: companyId,
                pay_frequency: row.pay_frequency,
                basic_salary: this.encryption.encryptNumber(newSalary),
                effective_date: effectiveDate,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        });
        const { error: insertErr } = await supabase
            .from('cnb_salary_baselines')
            .insert(insertRows);
        if (insertErr)
            throw new common_1.BadRequestException(insertErr.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'SALARY_ANNUALIZATION_BATCH',
            targetTable: 'cnb_salary_baselines',
            targetRecordId: crypto.randomUUID(),
            newValue: {
                annual_rate_percent: annualRatePercent,
                effective_date: effectiveDate,
                employee_count: targets.length,
            },
        });
        return {
            count: targets.length,
            annual_rate_percent: annualRatePercent,
            effective_date: effectiveDate,
            message: `Salary increased by ${annualRatePercent}% for ${targets.length} employees effective ${effectiveDate}.`,
            results: targets.map((row) => ({
                user_id: row.user_id,
                old_salary: Number(this.encryption.decrypt(String(row.basic_salary))),
                new_salary: this.roundCurrency(Number(this.encryption.decrypt(String(row.basic_salary))) * growthFactor),
            })),
        };
    }
    async computeRetirementBenefit(userId, companyId) {
        const supabase = this.supabaseService.getClient();
        const [salary, profileRes, retirementBenefitRes] = await Promise.all([
            this.getSalaryBaseline(userId, companyId),
            supabase
                .from('user_profile')
                .select('start_date, first_name, last_name, employee_id')
                .eq('user_id', userId)
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('cnb_benefits_catalog')
                .select('benefit_id, benefit_name, default_amount, benefit_type')
                .eq('company_id', companyId)
                .eq('benefit_type', 'retirement')
                .eq('is_active', true)
                .maybeSingle(),
        ]);
        if (profileRes.error)
            throw new common_1.BadRequestException(profileRes.error.message);
        const profile = profileRes.data;
        const retirementBenefit = retirementBenefitRes.data;
        const startDate = profile?.start_date ? new Date(String(profile.start_date)) : null;
        const today = new Date();
        const yearsOfService = startDate
            ? Math.floor((today.getTime() - startDate.getTime()) / (365.25 * 24 * 3600 * 1000))
            : 0;
        const monthsOfService = startDate
            ? Math.floor((today.getTime() - startDate.getTime()) / (30.44 * 24 * 3600 * 1000))
            : 0;
        const monthlyEquivalent = salary
            ? this.roundCurrency(this.toMonthlyEquivalent(Number(salary.basic_salary), salary.pay_frequency))
            : 0;
        const ra7641Amount = this.roundCurrency(22.5 * monthlyEquivalent * yearsOfService / 12);
        const companyRatePerYear = retirementBenefit ? Number(retirementBenefit.default_amount) : 0;
        const companyAmount = this.roundCurrency(companyRatePerYear * yearsOfService);
        const recommendedAmount = Math.max(ra7641Amount, companyAmount);
        return {
            user_id: userId,
            employee_id: profile?.employee_id ?? null,
            name: profile ? `${profile.first_name} ${profile.last_name}` : null,
            start_date: profile?.start_date ?? null,
            years_of_service: yearsOfService,
            months_of_service: monthsOfService,
            monthly_salary: monthlyEquivalent,
            computation: {
                ra7641_amount: ra7641Amount,
                ra7641_formula: '22.5 × monthly_salary × (years_of_service / 12)',
                company_rate_per_year: companyRatePerYear,
                company_amount: companyAmount,
                recommended_amount: recommendedAmount,
                basis: recommendedAmount === ra7641Amount ? 'RA 7641' : 'Company Policy',
            },
            benefit_catalog_entry: retirementBenefit ?? null,
        };
    }
    async updateCompanyBranding(companyId, updates, actorId) {
        const supabase = this.supabaseService.getClient();
        const payload = { updated_at: new Date().toISOString() };
        if (updates.logo_url !== undefined)
            payload.logo_url = updates.logo_url;
        if (updates.display_name !== undefined)
            payload.display_name = updates.display_name;
        if (updates.primary_color !== undefined)
            payload.primary_color = updates.primary_color;
        const { data, error } = await supabase
            .from('company')
            .update(payload)
            .eq('company_id', companyId)
            .select('company_id, company_name, display_name, logo_url, primary_color, updated_at')
            .maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.writeAudit({
            companyId,
            actorId,
            actionType: 'COMPANY_BRANDING_UPDATE',
            targetTable: 'company',
            targetRecordId: companyId,
            newValue: updates,
        });
        return data;
    }
    async getCompanyBranding(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('company')
            .select('company_id, company_name, display_name, logo_url, primary_color, subscription_status, subscription_duration')
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
};
exports.CnbService = CnbService;
exports.CnbService = CnbService = CnbService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        cnb_encryption_service_1.CnbEncryptionService])
], CnbService);
//# sourceMappingURL=cnb.service.js.map