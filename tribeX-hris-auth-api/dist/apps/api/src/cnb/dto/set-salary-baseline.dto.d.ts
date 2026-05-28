export declare enum PayFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    SEMI_MONTHLY = "semi-monthly"
}
export declare class SetSalaryBaselineDto {
    user_id: string;
    pay_frequency: PayFrequency;
    basic_salary: number;
    effective_date: string;
}
