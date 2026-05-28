import { SupabaseService } from '@app/supabase';
import { CnbEncryptionService } from './cnb-encryption.service';
type SalaryBaselineInput = {
    user_id: string;
    company_id: string;
    pay_frequency: string;
    basic_salary: number;
    effective_date: string;
};
type BenefitCatalogInput = {
    company_id: string;
    benefit_name: string;
    benefit_type: string;
    taxable: boolean;
    default_amount: number;
};
type AssignBenefitInput = {
    user_id: string;
    benefit_id: string;
    amount?: number;
    effective_date: string;
};
type BenefitCatalogUpdateInput = {
    benefit_name?: string;
    benefit_type?: string;
    taxable?: boolean;
    default_amount?: number;
    is_active?: boolean;
};
type StatutoryIdsInput = {
    tin_number?: string;
    sss_number?: string;
    philhealth_number?: string;
    pagibig_number?: string;
};
type TaxBracketInput = {
    effective_year: number;
    min_salary: number;
    max_salary: number;
    base_tax_amount: number;
    excess_percentage: number;
};
type AttendanceSummary = {
    scheduledDays: number;
    workedDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    payableDays: number;
    overtimeHours: number;
    lateHours: number;
    nightShiftHours: number;
    workedDateKeys: string[];
    holidayWorkedDates: string[];
};
export declare class CnbService {
    private readonly supabaseService;
    private readonly encryption;
    private readonly logger;
    constructor(supabaseService: SupabaseService, encryption: CnbEncryptionService);
    private roundCurrency;
    private parseIsoDate;
    private normalizeBenefitType;
    private isMissingColumnError;
    private toDateKey;
    private formatPayslipCode;
    private getCompanyHolidayMap;
    private maxDateKey;
    private buildUtcDate;
    private getMonthEndKey;
    private isWeekday;
    private listWeekdayKeys;
    private countWeekdaysInMonth;
    private normalizePositiveNumber;
    private normalizePayrollSettings;
    private getPayrollSettings;
    private parseScheduleMoment;
    private buildScheduleRange;
    private diffHours;
    private normalizePayFrequency;
    private toMonthlyEquivalent;
    private detectUnpaidLeave;
    private getSemiMonthlyFirstEligiblePayoutDate;
    private getMonthlyFirstEligiblePayoutDate;
    private getFirstEligiblePayoutDate;
    private writeAudit;
    private resolvePayrollCoverageWindow;
    getSalaryBaseline(userId: string, companyId: string, asOfDate?: string): Promise<any>;
    getAllSalaryBaselines(companyId: string): Promise<{
        baseline_id: any;
        user_id: any;
        employee_id: any;
        first_name: any;
        last_name: any;
        basic_salary: string;
        pay_frequency: any;
        effective_date: any;
    }[]>;
    setSalaryBaseline(dto: SalaryBaselineInput, actorId: string): Promise<any>;
    setBulkSalaryBaselines(companyId: string, basicSalary: number, payFrequency: string, effectiveDate: string, employeeIds?: string[], onlyMissing?: boolean, actorId?: string): Promise<{
        count: number;
        message: string;
        results: {
            user_id: any;
            employee_id: any;
            name: string;
            status: string;
        }[];
    }>;
    getBenefitsCatalog(companyId: string): Promise<any[]>;
    createBenefit(dto: BenefitCatalogInput, actorId: string): Promise<any>;
    updateBenefitCatalogItem(companyId: string, benefitId: string, dto: BenefitCatalogUpdateInput, actorId: string): Promise<any>;
    getEmployeeBenefits(userId: string, companyId: string, asOfDate?: string): Promise<{
        amount: string;
        benefit_name: any;
        benefit_type: any;
        taxable: any;
        mapping_id: any;
        user_id: any;
        benefit_id: any;
        effective_date: any;
    }[]>;
    assignBenefit(companyId: string, dto: AssignBenefitInput, actorId: string): Promise<any>;
    removeEmployeeBenefit(mappingId: string, companyId: string, actorId: string): Promise<{
        mapping_id: string;
        deleted: boolean;
    }>;
    private recordBenefitHistory;
    getBenefitHistory(userId: string): Promise<any[]>;
    getStatutoryIds(userId: string, companyId: string): Promise<any>;
    saveStatutoryIds(userId: string, companyId: string, dto: StatutoryIdsInput, actorId: string): Promise<any>;
    getTaxBrackets(companyId: string, year?: number): Promise<any[]>;
    createTaxBracket(companyId: string, dto: TaxBracketInput, actorId: string): Promise<any>;
    deleteTaxBracket(bracketId: string, companyId: string, actorId: string): Promise<{
        bracket_id: string;
        deleted: boolean;
    }>;
    reviewPayslip(payslipId: string, status: 'Approved' | 'Correction Needed', reviewerId: string, companyId: string): Promise<any>;
    getMyCompensation(userId: string, companyId: string): Promise<{
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
    getMyPayslips(userId: string, companyId: string): Promise<{
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
    getPayslipDetail(payslipId: string, companyId: string): Promise<{
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
    getPayslipDetailForUser(payslipId: string, requestor: {
        sub_userid: string;
        company_id: string;
        role_name: string;
    }): Promise<{
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
    private decryptPayslipRow;
    private buildPayslipBreakdown;
    private computeMonthlyStatutoryDeductions;
    private getAttendanceAndLeaveSummary;
    getBenefitDefaults(companyId: string): Promise<{
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
    setBenefitDefaults(companyId: string, dto: {
        sss?: {
            type: 'percentage' | 'fixed_amount';
            value: number;
        };
        philhealth?: {
            type: 'percentage' | 'fixed_amount';
            value: number;
        };
        pagibig?: {
            type: 'percentage' | 'fixed_amount';
            value: number;
        };
        notes?: string;
    }, actorId: string): Promise<{
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
    private getStatutoryDeductionDefaults;
    private buildCompensationSnapshot;
    computeOffboardingFinalPay(userId: string, companyId: string, lastWorkingDay: string): Promise<{
        salary_balance: number;
        leave_encashment: number;
        additional_pay: number;
        deductions: number;
        total_amount: number;
        breakdown: {
            covered_period_start: string;
            covered_period_end: string;
            attendance: AttendanceSummary;
            monthly_basic_equivalent: number;
            regular_benefits_total: number;
            one_time_benefits_total: number;
            remaining_leave_days: number;
            statutory: {
                sss: number;
                philhealth: number;
                pagibig: number;
                total: number;
            };
            tax: number;
        };
    }>;
    private computeIncomeTax;
    computeEmployeePayslip(userId: string, companyId: string, periodId: string, actorId: string, shared?: Parameters<typeof this.buildCompensationSnapshot>[4], preFetchedPeriod?: {
        cutoff_start_date: string;
        cutoff_end_date: string;
        payout_date: string;
    }): Promise<any>;
    runPayrollCutoff(companyId: string, cutoffStartDate: string, cutoffEndDate: string, payoutDate: string, actorId: string): Promise<{
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
    getPayrollPeriods(companyId: string): Promise<any[]>;
    getPayslipsForPeriod(periodId: string, companyId: string): Promise<{
        employee: {
            user_id: any;
            first_name: any;
            last_name: any;
            employee_id: any;
        } | null;
        breakdown: any;
    }[]>;
    private thirteenthMonthFromSalary;
    compute13thMonthPay(userId: string, companyId: string, year: number): Promise<{
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
    computeSalaryAnnualization(userId: string, companyId: string, annualRatePercent: number, years: number, startYear?: number): Promise<{
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
    getAnnualNetPay(userId: string, companyId: string, year: number): Promise<{
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
    applyAnnualizationBatch(companyId: string, annualRatePercent: number, effectiveDate: string, actorId: string, employeeIds?: string[]): Promise<{
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
    computeRetirementBenefit(userId: string, companyId: string): Promise<{
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
    updateCompanyBranding(companyId: string, updates: {
        logo_url?: string;
        display_name?: string;
        primary_color?: string;
    }, actorId: string): Promise<{
        company_id: any;
        company_name: any;
        display_name: any;
        logo_url: any;
        primary_color: any;
        updated_at: any;
    } | null>;
    getCompanyBranding(companyId: string): Promise<{
        company_id: any;
        company_name: any;
        display_name: any;
        logo_url: any;
        primary_color: any;
        subscription_status: any;
        subscription_duration: any;
    } | null>;
}
export {};
