import { SuperAdminCompaniesService } from './companies.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
export declare class SuperAdminCompaniesController {
    private readonly service;
    constructor(service: SuperAdminCompaniesService);
    list(query: Record<string, any>): Promise<{
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
    detail(id: string): Promise<{
        registration: any;
        config: any;
        modules: any[] | null;
    }>;
    updateStatus(id: string, dto: UpdateCompanyStatusDto, req: any): Promise<{
        success: boolean;
    }>;
    provision(id: string, req: any): Promise<{
        company_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
}
