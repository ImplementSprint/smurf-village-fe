import { SuperAdminSubscriptionsService } from './subscriptions.service';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto';
export declare class SuperAdminSubscriptionsController {
    private readonly service;
    constructor(service: SuperAdminSubscriptionsService);
    list(query: Record<string, any>): Promise<{
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
    detail(id: string): Promise<any>;
    updateStatus(id: string, dto: UpdateSubscriptionStatusDto, req: any): Promise<{
        success: boolean;
    }>;
    paymentHistory(id: string): Promise<{
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
