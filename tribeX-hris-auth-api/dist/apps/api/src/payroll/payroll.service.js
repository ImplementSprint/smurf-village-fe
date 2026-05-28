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
var PayrollService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
const common_2 = require("../../../../libs/common/src");
const cnb_service_1 = require("../cnb/cnb.service");
const cnb_encryption_service_1 = require("../cnb/cnb-encryption.service");
const timekeeping_service_1 = require("../timekeeping/timekeeping.service");
let PayrollService = PayrollService_1 = class PayrollService {
    supabaseService;
    cnbService;
    encryption;
    timekeepingService;
    logger = new common_1.Logger(PayrollService_1.name);
    constructor(supabaseService, cnbService, encryption, timekeepingService) {
        this.supabaseService = supabaseService;
        this.cnbService = cnbService;
        this.encryption = encryption;
        this.timekeepingService = timekeepingService;
    }
    formatPayslipCode(payslipId, payoutDate, createdAt) {
        const reference = payoutDate ?? createdAt ?? new Date().toISOString();
        const dateKey = reference.slice(0, 10).replaceAll('-', '');
        const suffix = payslipId.replaceAll('-', '').slice(-6).toUpperCase();
        return `PS-${dateKey}-${suffix}`;
    }
    async getMyPayslips(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('cnb_payslips')
            .select(`payslip_id, basic_pay_earned, total_allowances, gross_pay,
         tax_deduction, total_deductions, net_pay, status, employee_ack_status,
         acknowledged_at, created_at,
         period:period_id(period_id, cutoff_start_date, cutoff_end_date, payout_date)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'getMyPayslips', this.logger);
        }
        return (data ?? []).map((row) => ({
            payslip_id: row.payslip_id,
            payslip_code: this.formatPayslipCode(row.payslip_id, row.period?.payout_date ?? null, row.created_at),
            pay_period: row.period
                ? this.formatPayPeriod(row.period.cutoff_start_date, row.period.cutoff_end_date)
                : 'Unknown',
            basic_pay: this.encryption.decryptToNumber(row.basic_pay_earned),
            allowances: this.encryption.decryptToNumber(row.total_allowances),
            deductions: this.encryption.decryptToNumber(row.total_deductions),
            tax: this.encryption.decryptToNumber(row.tax_deduction),
            net_pay: this.encryption.decryptToNumber(row.net_pay),
            status: row.status,
            employee_ack_status: row.employee_ack_status,
            created_at: row.created_at,
            payout_date: row.period?.payout_date ?? null,
        }));
    }
    async getPayrollLedger(companyId, cutoffDate) {
        const supabase = this.supabaseService.getClient();
        let periodQuery = supabase
            .from('cnb_payroll_periods')
            .select('period_id, cutoff_start_date, cutoff_end_date, payout_date, status')
            .eq('company_id', companyId)
            .order('payout_date', { ascending: false });
        if (cutoffDate) {
            periodQuery = periodQuery.eq('payout_date', cutoffDate);
        }
        const { data: periods, error: periodsErr } = await periodQuery.limit(1);
        if (periodsErr) {
            common_2.DatabaseErrorHandler.handle(periodsErr, 'getPayrollLedger-periods', this.logger);
        }
        if (!periods || periods.length === 0) {
            return [];
        }
        const period = periods[0];
        const { data: payslips, error: payslipsErr } = await supabase
            .from('cnb_payslips')
            .select(`payslip_id, user_id, basic_pay_earned, gross_pay, total_deductions, net_pay, status`)
            .eq('period_id', period.period_id)
            .eq('company_id', companyId);
        if (payslipsErr) {
            common_2.DatabaseErrorHandler.handle(payslipsErr, 'getPayrollLedger-payslips', this.logger);
        }
        if (!payslips || payslips.length === 0)
            return [];
        const userIds = payslips.map((p) => p.user_id);
        const { data: users } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, first_name, last_name')
            .in('user_id', userIds);
        const userMap = new Map((users ?? []).map((u) => [
            u.user_id,
            { employee_id: u.employee_id, name: `${u.first_name} ${u.last_name}` },
        ]));
        return payslips.map((p) => {
            const emp = userMap.get(p.user_id);
            return {
                payroll_id: p.payslip_id,
                employee_id: emp?.employee_id ?? p.user_id,
                employee_name: emp?.name ?? 'Unknown',
                cutoff_date: period.payout_date,
                gross_pay: this.encryption.decryptToNumber(p.gross_pay),
                deductions: this.encryption.decryptToNumber(p.total_deductions),
                net_pay: this.encryption.decryptToNumber(p.net_pay),
                status: this.mapPayslipStatus(p.status),
            };
        });
    }
    async runPayrollCutoff(companyId, actorId, cutoffDate) {
        const supabase = this.supabaseService.getClient();
        if (!cutoffDate || !/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate)) {
            throw new common_1.BadRequestException('cutoff_date must be YYYY-MM-DD format.');
        }
        let period;
        const { data: existing } = await supabase
            .from('cnb_payroll_periods')
            .select('*')
            .eq('company_id', companyId)
            .eq('payout_date', cutoffDate)
            .maybeSingle();
        if (existing) {
            if (existing.status === 'Processed') {
                throw new common_1.BadRequestException(`Payroll for cutoff ${cutoffDate} has already been processed.`);
            }
            period = existing;
        }
        else {
            const cutoffEnd = new Date(cutoffDate);
            const cutoffStart = new Date(cutoffEnd);
            cutoffStart.setDate(1);
            const { data: created, error: createErr } = await supabase
                .from('cnb_payroll_periods')
                .insert({
                period_id: crypto.randomUUID(),
                company_id: companyId,
                cutoff_start_date: cutoffStart.toISOString().split('T')[0],
                cutoff_end_date: cutoffDate,
                payout_date: cutoffDate,
                status: 'Draft',
                processed_by: actorId,
            })
                .select()
                .single();
            if (createErr) {
                common_2.DatabaseErrorHandler.handle(createErr, 'runPayrollCutoff-create', this.logger);
            }
            period = created;
        }
        const { data: employees, error: empErr } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, first_name, last_name')
            .eq('company_id', companyId)
            .not('employee_id', 'is', null);
        if (empErr) {
            common_2.DatabaseErrorHandler.handle(empErr, 'runPayrollCutoff-employees', this.logger);
        }
        if (!employees || employees.length === 0) {
            throw new common_1.BadRequestException('No employees with an assigned employee_id found.');
        }
        await supabase
            .from('cnb_payroll_periods')
            .update({ status: 'Processing', processed_by: actorId })
            .eq('period_id', period.period_id);
        const { data: existingSlips } = await supabase
            .from('cnb_payslips')
            .select('user_id')
            .eq('period_id', period.period_id)
            .eq('company_id', companyId);
        const alreadyProcessed = new Set((existingSlips ?? []).map((s) => s.user_id));
        const pending = employees.filter((e) => !alreadyProcessed.has(e.user_id));
        let generated = alreadyProcessed.size;
        let skipped = 0;
        const outcomes = await Promise.allSettled(pending.map((employee) => this.generatePayslipForEmployee(supabase, employee.user_id, companyId, period)));
        for (let i = 0; i < outcomes.length; i++) {
            const result = outcomes[i];
            if (result.status === 'fulfilled') {
                generated++;
            }
            else {
                this.logger.warn(`Skipped payslip for ${pending[i].user_id}: ${result.reason?.message ?? result.reason}`);
                skipped++;
            }
        }
        await supabase
            .from('cnb_payroll_periods')
            .update({
            status: 'Processed',
            processed_at: new Date().toISOString(),
        })
            .eq('period_id', period.period_id);
        await supabase.from('cnb_audit_trail').insert({
            audit_id: crypto.randomUUID(),
            company_id: companyId,
            actor_id: actorId,
            action_type: 'PAYROLL_RUN',
            target_table: 'cnb_payroll_periods',
            target_record_id: period.period_id,
            new_value: JSON.stringify({ cutoff_date: cutoffDate, generated, skipped }),
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Payroll run complete — period: ${period.period_id}, generated: ${generated}, skipped: ${skipped}`);
        return {
            message: `Payroll processed for cutoff ${cutoffDate}.`,
            period_id: period.period_id,
            generated,
            skipped,
        };
    }
    async generatePayslipForEmployee(supabase, userId, companyId, period) {
        const salaryRow = await this.cnbService.getSalaryBaseline(userId, companyId, period.cutoff_end_date);
        if (!salaryRow) {
            throw new common_1.BadRequestException('No salary baseline found for this employee.');
        }
        const basicSalary = parseFloat(salaryRow.basic_salary) || 0;
        const benefitRows = await this.cnbService.getEmployeeBenefits(userId, companyId, period.cutoff_end_date);
        let totalAllowances = 0;
        for (const b of benefitRows) {
            const amt = parseFloat(b.amount) || 0;
            if (b.benefit_type !== 'one_time_incentive') {
                totalAllowances += amt;
            }
        }
        const attendanceData = await this.getAttendanceForPeriod(userId, period.cutoff_start_date, period.cutoff_end_date);
        const absenceDeduction = await this.calculateAbsenceDeduction(basicSalary, attendanceData);
        const tardinessDeduction = this.calculateTardinessDeduction(basicSalary, attendanceData);
        const overtimePay = this.calculateOvertimePay(basicSalary, attendanceData);
        const attendanceBonus = this.calculateAttendanceBonus(basicSalary, attendanceData);
        const adjustedBasicSalary = Math.max(0, basicSalary - absenceDeduction);
        const grossPay = adjustedBasicSalary + totalAllowances + overtimePay + attendanceBonus;
        const taxDeduction = await this.computeTax(supabase, companyId, grossPay, period.cutoff_end_date);
        const statutoryDeductionsAmount = this.computeStatutory(adjustedBasicSalary);
        const totalDeductions = taxDeduction + statutoryDeductionsAmount + tardinessDeduction;
        const netPay = grossPay - totalDeductions;
        const { error } = await supabase.from('cnb_payslips').insert({
            payslip_id: crypto.randomUUID(),
            period_id: period.period_id,
            user_id: userId,
            company_id: companyId,
            basic_pay_earned: this.encryption.encryptNumber(Math.round(adjustedBasicSalary * 100) / 100),
            total_allowances: this.encryption.encryptNumber(Math.round(totalAllowances * 100) / 100),
            gross_pay: this.encryption.encryptNumber(Math.round(grossPay * 100) / 100),
            tax_deduction: this.encryption.encryptNumber(Math.round(taxDeduction * 100) / 100),
            statutory_deductions: this.encryption.encryptNumber(Math.round(statutoryDeductionsAmount * 100) / 100),
            total_deductions: this.encryption.encryptNumber(Math.round(totalDeductions * 100) / 100),
            net_pay: this.encryption.encryptNumber(Math.round(netPay * 100) / 100),
            status: 'Pending Review',
            employee_ack_status: 'Pending',
            attendance_metadata: JSON.stringify({
                absences: attendanceData.totalAbsences,
                late_hours: attendanceData.totalLateHours,
                overtime_hours: attendanceData.totalOvertimeHours,
                attendance_rate: attendanceData.attendanceRate,
                absence_deduction: Math.round(absenceDeduction * 100) / 100,
                tardiness_deduction: Math.round(tardinessDeduction * 100) / 100,
                overtime_pay: Math.round(overtimePay * 100) / 100,
                attendance_bonus: Math.round(attendanceBonus * 100) / 100,
            }),
        });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'generatePayslipForEmployee', this.logger);
        }
    }
    async computeTax(supabase, companyId, grossPay, referenceDate) {
        const year = new Date(referenceDate).getFullYear();
        const { data: bracket } = await supabase
            .from('cnb_tax_brackets')
            .select('base_tax_amount, min_salary, excess_percentage')
            .eq('company_id', companyId)
            .eq('effective_year', year)
            .lte('min_salary', grossPay)
            .gte('max_salary', grossPay)
            .limit(1)
            .maybeSingle();
        if (!bracket)
            return 0;
        const excess = grossPay - Number(bracket.min_salary);
        const tax = Number(bracket.base_tax_amount) +
            excess * (Number(bracket.excess_percentage) / 100);
        return Math.max(0, tax);
    }
    computeStatutory(basicSalary) {
        const sss = Math.min(basicSalary * 0.045, 900);
        const philhealth = Math.min(basicSalary * 0.025, 2500);
        const pagibig = Math.min(basicSalary * 0.02, 200);
        return sss + philhealth + pagibig;
    }
    formatPayPeriod(start, end) {
        const s = new Date(start);
        const e = new Date(end);
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];
        const sMonth = months[s.getMonth()];
        const eMonth = months[e.getMonth()];
        const year = e.getFullYear();
        if (s.getMonth() === e.getMonth()) {
            return `${sMonth} ${s.getDate()}–${e.getDate()}, ${year}`;
        }
        return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${year}`;
    }
    mapPayslipStatus(status) {
        const map = {
            'Pending Review': 'draft',
            Approved: 'processed',
            Released: 'released',
            'Final Pay': 'released',
        };
        return map[status] ?? 'draft';
    }
    async getAttendanceForPeriod(userId, startDate, endDate) {
        const supabase = this.supabaseService.getClient();
        const { data: userProfile } = await supabase
            .from('user_profile')
            .select('employee_id')
            .eq('user_id', userId)
            .maybeSingle();
        if (!userProfile?.employee_id) {
            return {
                totalAbsences: 0,
                totalLateHours: 0,
                totalOvertimeHours: 0,
                attendanceRate: 100,
                scheduledDays: 0,
                workingDays: 0,
            };
        }
        const { data: logs, error } = await supabase
            .from('attendance_time_logs')
            .select('log_type, log_status, timestamp, clock_type')
            .eq('employee_id', userProfile.employee_id)
            .gte('timestamp', `${startDate}T00:00:00Z`)
            .lte('timestamp', `${endDate}T23:59:59Z`);
        if (error) {
            this.logger.warn(`Failed to fetch attendance for payroll period: ${error.message}`);
            return {
                totalAbsences: 0,
                totalLateHours: 0,
                totalOvertimeHours: 0,
                attendanceRate: 100,
                scheduledDays: 0,
                workingDays: 0,
            };
        }
        let absences = 0;
        let lateHours = 0;
        let overtimeHours = 0;
        const daysWorked = new Set();
        const lateDays = new Set();
        for (const log of logs ?? []) {
            const date = log.timestamp.split('T')[0];
            daysWorked.add(date);
            if (log.log_type === 'absence' && log.log_status !== 'DENIED') {
                absences++;
                daysWorked.delete(date);
            }
            else if (log.clock_type === 'LATE' && log.log_status !== 'PENDING') {
                lateDays.add(date);
            }
            else if (log.clock_type === 'OVERTIME') {
                overtimeHours += 0.5;
            }
        }
        lateHours = lateDays.size * 0.5;
        const workingDays = daysWorked.size;
        const scheduledDays = this.getBusinessDaysInRange(startDate, endDate);
        const attendanceRate = scheduledDays > 0 ? Math.round(((scheduledDays - absences) / scheduledDays) * 100) : 100;
        return {
            totalAbsences: absences,
            totalLateHours: lateHours,
            totalOvertimeHours: overtimeHours,
            attendanceRate,
            scheduledDays,
            workingDays,
        };
    }
    async calculateAbsenceDeduction(basicSalary, attendanceData) {
        const dailyRate = basicSalary / 22;
        return attendanceData.totalAbsences * dailyRate;
    }
    calculateTardinessDeduction(basicSalary, attendanceData) {
        const LATE_DEDUCTION_PER_HOUR = 50;
        return attendanceData.totalLateHours * LATE_DEDUCTION_PER_HOUR;
    }
    calculateOvertimePay(basicSalary, attendanceData) {
        const dailyRate = basicSalary / 22;
        const hourlyRate = dailyRate / 8;
        const overtimeRate = hourlyRate * 1.25;
        return attendanceData.totalOvertimeHours * overtimeRate;
    }
    calculateAttendanceBonus(basicSalary, attendanceData) {
        const { attendanceRate } = attendanceData;
        if (attendanceRate >= 95) {
            return basicSalary * 0.05;
        }
        else if (attendanceRate >= 90) {
            return basicSalary * 0.03;
        }
        else if (attendanceRate >= 85) {
            return basicSalary * 0.01;
        }
        return 0;
    }
    getBusinessDaysInRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let businessDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                businessDays++;
            }
        }
        return businessDays;
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        cnb_service_1.CnbService,
        cnb_encryption_service_1.CnbEncryptionService,
        timekeeping_service_1.TimekeepingService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map