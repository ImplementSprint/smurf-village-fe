import { SuperAdminRenewalsService } from './renewals.service';
declare class MarkRenewedDto {
    billing_cycle: 'monthly' | 'annual';
}
export declare class SuperAdminRenewalsController {
    private readonly service;
    constructor(service: SuperAdminRenewalsService);
    list(status?: string): Promise<({
        end_date: string;
        days_remaining: number;
        renewal_status: "Expired" | "Upcoming" | "Due Soon";
        registration_id: any;
        company_id: any;
        company_name: any;
        subscription_plan: any;
        billing_cycle: any;
        payment_date: any;
        email: any;
        subscription_status: any;
    } | null)[]>;
    remind(id: string, req: any): Promise<{
        success: boolean;
        days_remaining: number;
    }>;
    markRenewed(id: string, dto: MarkRenewedDto, req: any): Promise<{
        success: boolean;
    }>;
    suspend(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
export {};
