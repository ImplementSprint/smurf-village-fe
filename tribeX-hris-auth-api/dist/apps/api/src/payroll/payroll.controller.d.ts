import { PayrollService } from './payroll.service';
import { RunPayrollCutoffDto } from './dto/run-payroll-cutoff.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    getMyPayslips(req: AuthenticatedRequest): Promise<{
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
    getPayrollLedger(req: AuthenticatedRequest, cutoff?: string): Promise<{
        payroll_id: any;
        employee_id: any;
        employee_name: string;
        cutoff_date: any;
        gross_pay: number;
        deductions: number;
        net_pay: number;
        status: "draft" | "processed" | "released";
    }[]>;
    runPayrollCutoff(req: AuthenticatedRequest, dto: RunPayrollCutoffDto): Promise<{
        message: string;
        period_id: any;
        generated: number;
        skipped: number;
    }>;
}
