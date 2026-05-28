import { SupabaseService } from '@app/supabase';
interface LeaveConfig {
    config_id: string;
    company_id: string;
    accrual_rate: number;
    year_end_rule: 'RESET' | 'CARRY_ALL' | 'CARRY_CAP';
    carry_over_max: number | null;
}
export declare class LeaveAccrualService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getConfig(companyId: string): Promise<LeaveConfig>;
    upsertConfig(companyId: string, changedBy: string, patch: Partial<Pick<LeaveConfig, 'accrual_rate' | 'year_end_rule' | 'carry_over_max'>>): Promise<LeaveConfig>;
    runMonthlyAccrual(): Promise<void>;
    runYearEndCarryOver(): Promise<void>;
}
export {};
