import { SupabaseService } from '@app/supabase';
export declare class SuperAdminCompaniesService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    list(query: {
        status?: string;
        plan?: string;
        industry?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            registration_id: any;
            company_id: any;
            company_name: any;
            email: any;
            industry: any;
            subscription_plan: any;
            subscription_status: any;
            payment_status: any;
            billing_cycle: any;
            payment_date: any;
            transaction_id: any;
            company: {
                company_name: any;
                slug: any;
            }[];
        }[];
        total: number | null;
        page: number;
        limit: number;
    }>;
    detail(companyId: string): Promise<{
        registration: any;
        config: any;
        modules: any[] | null;
    }>;
    updateStatus(registrationId: string, subscriptionStatus: string, performedBy: string): Promise<{
        success: boolean;
    }>;
    provision(registrationId: string, performedBy: string): Promise<{
        company_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
}
