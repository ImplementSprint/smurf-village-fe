import { SupabaseService } from '@app/supabase';
export declare class SuperAdminSubscriptionsService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    private computeEndDate;
    list(query: {
        status?: string;
        billing_cycle?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            start_date: any;
            end_date: string;
            registration_id: any;
            company_id: any;
            company_name: any;
            subscription_plan: any;
            billing_cycle: any;
            subscription_status: any;
            payment_status: any;
            payment_date: any;
            transaction_id: any;
        }[];
        total: number | null;
        page: number;
        limit: number;
    }>;
    detail(registrationId: string): Promise<any>;
    updateStatus(registrationId: string, subscriptionStatus: string, performedBy: string): Promise<{
        success: boolean;
    }>;
    paymentHistory(registrationId: string): Promise<{
        records: {
            registration_id: any;
            payment_status: any;
            payment_date: any;
            transaction_id: any;
            billing_cycle: any;
            subscription_plan: any;
        }[];
        total: number;
    }>;
}
