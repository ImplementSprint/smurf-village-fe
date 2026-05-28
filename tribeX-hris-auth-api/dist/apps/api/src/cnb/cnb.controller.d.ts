import { CnbService } from './cnb.service';
import type { AuthenticatedRequest } from '@app/common';
import { SetSalaryBaselineDto } from './dto/set-salary-baseline.dto';
import { BulkSetSalaryBaselineDto } from './dto/bulk-set-salary-baseline.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { AssignBenefitDto } from './dto/assign-benefit.dto';
import { SaveStatutoryIdsDto } from './dto/save-statutory-ids.dto';
import { SetTaxBracketDto } from './dto/set-tax-bracket.dto';
import { UpdateBenefitCatalogDto } from './dto/update-benefit-catalog.dto';
import { SetStatutoryDeductionsDto } from './dto/set-statutory-deductions.dto';
export declare class CnbController {
    private readonly cnbService;
    constructor(cnbService: CnbService);
    getAllSalaryBaselines(req: AuthenticatedRequest): Promise<{
        baseline_id: any;
        user_id: any;
        employee_id: any;
        first_name: any;
        last_name: any;
        basic_salary: string;
        pay_frequency: any;
        effective_date: any;
    }[]>;
    getSalaryBaseline(userId: string, req: AuthenticatedRequest): Promise<any>;
    setSalaryBaseline(dto: SetSalaryBaselineDto, req: AuthenticatedRequest): Promise<any>;
    setBulkSalaryBaselines(dto: BulkSetSalaryBaselineDto, req: AuthenticatedRequest): Promise<{
        count: number;
        message: string;
        results: {
            user_id: any;
            employee_id: any;
            name: string;
            status: string;
        }[];
    }>;
    getStatutoryConfig(req: AuthenticatedRequest): Promise<{
        company_id: string;
        sss: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        philhealth: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        pagibig: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        sss_amount: number;
        philhealth_amount: number;
        pagibig_amount: number;
        other_statutory_amount: number;
        notes: any;
        updated_at: any;
    }>;
    setStatutoryConfig(dto: SetStatutoryDeductionsDto, req: AuthenticatedRequest): Promise<{
        company_id: string;
        sss: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        philhealth: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        pagibig: {
            type: "percentage" | "fixed_amount";
            value: number;
        };
        sss_amount: number;
        philhealth_amount: number;
        pagibig_amount: number;
        other_statutory_amount: number;
        notes: any;
        updated_at: any;
    }>;
    getBenefitsCatalog(req: AuthenticatedRequest): Promise<any[]>;
    createBenefit(dto: CreateBenefitDto, req: AuthenticatedRequest): Promise<any>;
    updateBenefitCatalogItem(benefitId: string, dto: UpdateBenefitCatalogDto, req: AuthenticatedRequest): Promise<any>;
    getEmployeeBenefits(userId: string, req: AuthenticatedRequest): Promise<{
        amount: string;
        benefit_name: any;
        benefit_type: any;
        taxable: any;
        mapping_id: any;
        user_id: any;
        benefit_id: any;
        effective_date: any;
    }[]>;
    assignBenefit(dto: AssignBenefitDto, req: AuthenticatedRequest): Promise<any>;
    removeEmployeeBenefit(mappingId: string, req: AuthenticatedRequest): Promise<{
        mapping_id: string;
        deleted: boolean;
    }>;
    getBenefitHistory(userId: string, req: AuthenticatedRequest): Promise<any[]>;
    getStatutoryIds(userId: string, req: AuthenticatedRequest): Promise<any>;
    saveStatutoryIds(userId: string, dto: SaveStatutoryIdsDto, req: AuthenticatedRequest): Promise<any>;
    getTaxBrackets(req: AuthenticatedRequest, year?: string): Promise<any[]>;
    createTaxBracket(req: AuthenticatedRequest, dto: SetTaxBracketDto): Promise<any>;
    deleteTaxBracket(bracketId: string, req: AuthenticatedRequest): Promise<{
        bracket_id: string;
        deleted: boolean;
    }>;
    reviewPayslip(payslipId: string, dto: {
        status: 'Approved' | 'Correction Needed';
    }, req: AuthenticatedRequest): Promise<any>;
    getMyCompensation(req: AuthenticatedRequest): Promise<{
        salary: any;
        benefits: {
            amount: string;
            benefit_name: any;
            benefit_type: any;
            taxable: any;
            mapping_id: any;
            user_id: any;
            benefit_id: any;
            effective_date: any;
        }[];
        statutory: any;
    }>;
    getMyPayslips(req: AuthenticatedRequest): Promise<{
        payslip_code: string;
        employee: {
            user_id: any;
            first_name: any;
            last_name: any;
            employee_id: any;
            email: any;
        } | null;
        company: {
            company_display_name: string | null;
            company_logo_url: string | null;
            company_id: any;
            company_name: any;
        } | null;
        breakdown: any;
    }[]>;
    getPayslipDetail(payslipId: string, req: AuthenticatedRequest): Promise<{
        payslip_code: string;
        benefits: {
            amount: string;
            benefit_name: any;
            benefit_type: any;
            taxable: any;
            mapping_id: any;
            user_id: any;
            benefit_id: any;
            effective_date: any;
        }[];
        breakdown: unknown;
        employee: {
            user_id: any;
            first_name: any;
            last_name: any;
            employee_id: any;
            email: any;
        } | null;
        company: {
            company_display_name: string | null;
            company_logo_url: string | null;
            company_id: any;
            company_name: any;
        } | null;
    }>;
    compute13thMonth(userId: string, req: AuthenticatedRequest, year?: string): Promise<{
        year: number;
        monthly_salary: number;
        months_eligible: number;
        thirteenth_month_pay: number;
        note: string;
        pay_frequency?: undefined;
    } | {
        year: number;
        pay_frequency: any;
        monthly_salary: number;
        months_eligible: number;
        thirteenth_month_pay: number;
        note?: undefined;
    }>;
    compute13thMonthSelf(req: AuthenticatedRequest, year?: string): Promise<{
        year: number;
        monthly_salary: number;
        months_eligible: number;
        thirteenth_month_pay: number;
        note: string;
        pay_frequency?: undefined;
    } | {
        year: number;
        pay_frequency: any;
        monthly_salary: number;
        months_eligible: number;
        thirteenth_month_pay: number;
        note?: undefined;
    }>;
    computeSalaryAnnualization(userId: string, req: AuthenticatedRequest, annualRatePercent?: string, years?: string, startYear?: string): Promise<{
        pay_frequency: null;
        annual_rate_percent: number;
        years: number;
        schedule: never[];
        note: string;
    } | {
        pay_frequency: "monthly" | "daily" | "weekly" | "semi-monthly";
        annual_rate_percent: number;
        years: number;
        schedule: {
            year: number;
            pay_frequency: "monthly" | "daily" | "weekly" | "semi-monthly";
            per_period_salary: number;
            monthly_equivalent: number;
            annual_equivalent: number;
        }[];
        note?: undefined;
    }>;
    runPayrollCutoff(req: AuthenticatedRequest, dto: {
        cutoff_start_date: string;
        cutoff_end_date: string;
        payout_date: string;
    }): Promise<{
        period_id: string;
        cutoff_start_date: string;
        cutoff_end_date: string;
        payout_date: string;
        total_employees: number;
        computed: number;
        skipped: number;
        results: {
            user_id: string;
            name: string;
            employee_id: string | null;
            payslip?: unknown;
            error?: string;
        }[];
    }>;
    getPayrollPeriods(req: AuthenticatedRequest): Promise<any[]>;
    getPayslipsForPeriod(periodId: string, req: AuthenticatedRequest): Promise<{
        employee: {
            user_id: any;
            first_name: any;
            last_name: any;
            employee_id: any;
        } | null;
        breakdown: any;
    }[]>;
    computeSinglePayslip(userId: string, req: AuthenticatedRequest, dto: {
        period_id: string;
    }): Promise<any>;
    getMyAnnualPay(req: AuthenticatedRequest, year?: string): Promise<{
        year: number;
        payslip_count: number;
        total_net_pay: number;
        total_gross_pay: number;
        total_deductions: number;
        total_tax: number;
        periods: {
            payslip_id: any;
            payslip_code: string;
            pay_period: string;
            net_pay: number;
            gross_pay: number;
            deductions: number;
            tax: number;
            status: any;
            payout_date: any;
        }[];
    }>;
    getEmployeeAnnualPay(userId: string, req: AuthenticatedRequest, year?: string): Promise<{
        year: number;
        payslip_count: number;
        total_net_pay: number;
        total_gross_pay: number;
        total_deductions: number;
        total_tax: number;
        periods: {
            payslip_id: any;
            payslip_code: string;
            pay_period: string;
            net_pay: number;
            gross_pay: number;
            deductions: number;
            tax: number;
            status: any;
            payout_date: any;
        }[];
    }>;
    applyAnnualizationBatch(req: AuthenticatedRequest, dto: {
        annual_rate_percent: number;
        effective_date: string;
        employee_ids?: string[];
    }): Promise<{
        count: number;
        message: string;
        results: never[];
        annual_rate_percent?: undefined;
        effective_date?: undefined;
    } | {
        count: number;
        annual_rate_percent: number;
        effective_date: string;
        message: string;
        results: {
            user_id: any;
            old_salary: number;
            new_salary: number;
        }[];
    }>;
    computeRetirement(userId: string, req: AuthenticatedRequest): Promise<{
        user_id: string;
        employee_id: any;
        name: string | null;
        start_date: any;
        years_of_service: number;
        months_of_service: number;
        monthly_salary: number;
        computation: {
            ra7641_amount: number;
            ra7641_formula: string;
            company_rate_per_year: number;
            company_amount: number;
            recommended_amount: number;
            basis: string;
        };
        benefit_catalog_entry: {
            benefit_id: any;
            benefit_name: any;
            default_amount: any;
            benefit_type: any;
        } | null;
    }>;
    computeRetirementSelf(req: AuthenticatedRequest): Promise<{
        user_id: string;
        employee_id: any;
        name: string | null;
        start_date: any;
        years_of_service: number;
        months_of_service: number;
        monthly_salary: number;
        computation: {
            ra7641_amount: number;
            ra7641_formula: string;
            company_rate_per_year: number;
            company_amount: number;
            recommended_amount: number;
            basis: string;
        };
        benefit_catalog_entry: {
            benefit_id: any;
            benefit_name: any;
            default_amount: any;
            benefit_type: any;
        } | null;
    }>;
    getCompanyBranding(req: AuthenticatedRequest): Promise<{
        company_id: any;
        company_name: any;
        display_name: any;
        logo_url: any;
        primary_color: any;
        subscription_status: any;
        subscription_duration: any;
    } | null>;
    updateCompanyBranding(req: AuthenticatedRequest, dto: {
        logo_url?: string;
        display_name?: string;
        primary_color?: string;
    }): Promise<{
        company_id: any;
        company_name: any;
        display_name: any;
        logo_url: any;
        primary_color: any;
        updated_at: any;
    } | null>;
}
