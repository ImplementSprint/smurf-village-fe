import { SupabaseService } from '@app/supabase';
import { CnbService } from '../cnb/cnb.service';
import { CnbEncryptionService } from '../cnb/cnb-encryption.service';
import { TimekeepingService } from '../timekeeping/timekeeping.service';
export declare class PayrollService {
    private readonly supabaseService;
    private readonly cnbService;
    private readonly encryption;
    private readonly timekeepingService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, cnbService: CnbService, encryption: CnbEncryptionService, timekeepingService: TimekeepingService);
    private formatPayslipCode;
    getMyPayslips(userId: string): Promise<{
        payslip_id: any;
        payslip_code: string;
        pay_period: string;
        basic_pay: number;
        allowances: number;
        deductions: number;
        tax: number;
        net_pay: number;
        status: any;
        employee_ack_status: any;
        created_at: any;
        payout_date: any;
    }[]>;
    getPayrollLedger(companyId: string, cutoffDate?: string): Promise<{
        payroll_id: any;
        employee_id: any;
        employee_name: string;
        cutoff_date: any;
        gross_pay: number;
        deductions: number;
        net_pay: number;
        status: "draft" | "processed" | "released";
    }[]>;
    runPayrollCutoff(companyId: string, actorId: string, cutoffDate: string): Promise<{
        message: string;
        period_id: any;
        generated: number;
        skipped: number;
    }>;
    private generatePayslipForEmployee;
    private computeTax;
    private computeStatutory;
    private formatPayPeriod;
    private mapPayslipStatus;
    private getAttendanceForPeriod;
    private calculateAbsenceDeduction;
    private calculateTardinessDeduction;
    private calculateOvertimePay;
    private calculateAttendanceBonus;
    private getBusinessDaysInRange;
}
