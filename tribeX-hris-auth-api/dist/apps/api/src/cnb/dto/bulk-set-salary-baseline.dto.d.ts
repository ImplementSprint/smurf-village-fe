export declare class BulkSetSalaryBaselineDto {
    basic_salary: number;
    pay_frequency: 'monthly' | 'semi-monthly' | 'weekly' | 'daily';
    effective_date: string;
    employee_ids?: string[];
    only_missing?: boolean;
}
