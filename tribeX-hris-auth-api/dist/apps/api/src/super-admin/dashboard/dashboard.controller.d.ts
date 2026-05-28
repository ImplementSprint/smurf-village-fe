import { SuperAdminDashboardService } from './dashboard.service';
export declare class SuperAdminDashboardController {
    private readonly service;
    constructor(service: SuperAdminDashboardService);
    stats(): Promise<{
        total_companies: number;
        active_subscriptions: number;
        pending_approvals: number;
        suspended_count: number;
        expired_count: number;
        monthly_revenue: null;
    }>;
    pendingApprovals(): Promise<{
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
