import { SupabaseService } from '@app/supabase';
export declare class SuperAdminDashboardService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getStats(): Promise<{
        total_companies: number;
        active_subscriptions: number;
        pending_approvals: number;
        suspended_count: number;
        expired_count: number;
        monthly_revenue: null;
    }>;
    getPendingApprovals(): Promise<{
        registration_id: any;
        company_id: any;
        company_name: any;
        email: any;
        industry: any;
        subscription_plan: any;
        billing_cycle: any;
        registered_date: any;
    }[]>;
}
