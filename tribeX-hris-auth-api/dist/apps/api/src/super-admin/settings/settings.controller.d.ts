import { SuperAdminSettingsService } from './settings.service';
declare class UpdateProfileDto {
    name: string;
}
declare class UpdateNotificationsDto {
    notify_new_signup: boolean;
    notify_payment: boolean;
    notify_renewal_due: boolean;
    notify_expiry: boolean;
}
declare class ChangePasswordDto {
    current_password: string;
    new_password: string;
    confirm_password: string;
}
export declare class SuperAdminSettingsController {
    private readonly service;
    constructor(service: SuperAdminSettingsService);
    getProfile(req: any): Promise<{
        id: any;
        email: any;
        name: any;
        created_at: any;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        success: boolean;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    getNotifications(req: any): Promise<any>;
    updateNotifications(req: any, dto: UpdateNotificationsDto): Promise<{
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
    getSystem(): {
        payment_gateway: null;
        credential_provisioning: null;
    };
}
export {};
