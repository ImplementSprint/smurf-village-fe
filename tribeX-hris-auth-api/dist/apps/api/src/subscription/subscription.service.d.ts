import { ConfigService } from '@nestjs/config';
import { ApiCenterSdkService } from '@app/api-center';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '@app/supabase';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentConfirmDto } from './dto/payment-confirm.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { SelectPlanDto } from './dto/select-plan.dto';
export declare class SubscriptionService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly config;
    private readonly apiCenterSdkService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mailService: MailService, config: ConfigService, apiCenterSdkService: ApiCenterSdkService);
    getPlans(): {
        plan_id: string;
        name: string;
        billing_cycle: string;
        price_php: number;
    }[];
    register(dto: RegisterCompanyDto): Promise<{
        registration_id: any;
        message: string;
    }>;
    selectPlan(dto: SelectPlanDto): Promise<any>;
    getRegistrationStatus(registrationId: string): Promise<{
        registration_id: any;
        payment_status: any;
        subscription_status: any;
        subscription_plan: any;
        company_name: any;
    }>;
    createCheckout(dto: CreateCheckoutDto): Promise<{
        checkout_url: string;
        checkout_id: string;
    }>;
    confirmPayment(dto: PaymentConfirmDto): Promise<{
        message: string;
        registration_id: string;
    }>;
    private provisionTenant;
    private getOrCreateSystemAdminRole;
}
