import { SupabaseService } from '@app/supabase';
export declare class SuperAdminSettingsService {
    private readonly supabase;
    constructor(supabase: SupabaseService);
    getProfile(adminId: string): Promise<{
        id: any;
        email: any;
        name: any;
        created_at: any;
    }>;
    updateProfile(adminId: string, name: string): Promise<{
        success: boolean;
    }>;
    changePassword(adminId: string, adminEmail: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    getNotifications(adminId: string): Promise<any>;
    updateNotifications(adminId: string, prefs: {
        notify_new_signup: boolean;
        notify_payment: boolean;
        notify_renewal_due: boolean;
        notify_expiry: boolean;
    }): Promise<{
        success: boolean;
    }>;
    getAuditLog(): Promise<{
        id: any;
        action: any;
        performed_by: any;
        company_id: any;
        severity: any;
        created_at: any;
    }[]>;
    getSystemSettings(): {
        payment_gateway: null;
        credential_provisioning: null;
    };
}
