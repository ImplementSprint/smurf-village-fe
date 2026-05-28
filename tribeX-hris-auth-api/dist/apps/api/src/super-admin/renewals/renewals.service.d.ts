import { SupabaseService } from '@app/supabase';
import { MailService } from '../../mail/mail.service';
type RenewalStatus = 'Upcoming' | 'Due Soon' | 'Expired';
export declare class SuperAdminRenewalsService {
    private readonly supabase;
    private readonly mail;
    constructor(supabase: SupabaseService, mail: MailService);
    private computeEndDate;
    private getRenewalStatus;
    list(statusFilter?: string): Promise<({
        end_date: string;
        days_remaining: number;
        renewal_status: RenewalStatus;
        registration_id: any;
        company_id: any;
        company_name: any;
        subscription_plan: any;
        billing_cycle: any;
        payment_date: any;
        email: any;
        subscription_status: any;
    } | null)[]>;
    sendReminder(registrationId: string, performedBy: string): Promise<{
        success: boolean;
        days_remaining: number;
    }>;
    markRenewed(registrationId: string, billingCycle: 'monthly' | 'annual', performedBy: string): Promise<{
        success: boolean;
    }>;
    suspend(registrationId: string, performedBy: string): Promise<{
        success: boolean;
    }>;
}
export {};
