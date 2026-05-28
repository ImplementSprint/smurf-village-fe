import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentConfirmDto } from './dto/payment-confirm.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { SelectPlanDto } from './dto/select-plan.dto';
import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
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
    createCheckout(dto: CreateCheckoutDto): Promise<{
        checkout_url: string;
        checkout_id: string;
    }>;
    confirmPayment(dto: PaymentConfirmDto): Promise<{
        message: string;
        registration_id: string;
    }>;
    getStatus(id: string): Promise<{
        registration_id: any;
        payment_status: any;
        subscription_status: any;
        subscription_plan: any;
        company_name: any;
    }>;
}
