"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("node:crypto"));
const api_center_1 = require("../../../../libs/api-center/src");
const mail_service_1 = require("../mail/mail.service");
const supabase_1 = require("../../../../libs/supabase/src");
const MODULES = [
    'recruitment',
    'onboarding',
    'compensation',
    'performance',
    'offboarding',
];
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    supabaseService;
    mailService;
    config;
    apiCenterSdkService;
    logger = new common_1.Logger(SubscriptionService_1.name);
    constructor(supabaseService, mailService, config, apiCenterSdkService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
        this.config = config;
        this.apiCenterSdkService = apiCenterSdkService;
    }
    getPlans() {
        return [
            {
                plan_id: 'monthly',
                name: 'Monthly Plan',
                billing_cycle: 'monthly',
                price_php: 2999,
            },
            {
                plan_id: 'annual',
                name: 'Annual Plan',
                billing_cycle: 'annual',
                price_php: 29999,
            },
        ];
    }
    async register(dto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('company_registrations')
            .insert({
            company_name: dto.company_name.trim(),
            address: dto.address,
            contact: dto.contact,
            email: dto.email.trim().toLowerCase(),
            industry: dto.industry,
            nature_of_business: dto.nature_of_business,
            tin: dto.tin,
            business_permit_url: dto.business_permit_url ?? null,
            registration_cert_url: dto.registration_cert_url ?? null,
            hr_org_structure: dto.hr_org_structure ?? null,
            status: 'Registered',
            payment_status: 'Pending',
            subscription_status: 'Pending',
        })
            .select('registration_id')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        this.mailService
            .sendRegistrationConfirmation(dto.email, dto.company_name)
            .catch((err) => {
            this.logger.error(`Failed to send registration confirmation to ${dto.email}`, err);
        });
        return {
            registration_id: data.registration_id,
            message: 'Registration submitted. Check your email for confirmation.',
        };
    }
    async selectPlan(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: existing, error: fetchErr } = await supabase
            .from('company_registrations')
            .select('registration_id, payment_status')
            .eq('registration_id', dto.registration_id)
            .maybeSingle();
        if (fetchErr)
            throw new common_1.InternalServerErrorException(fetchErr.message);
        if (!existing)
            throw new common_1.NotFoundException('Registration not found');
        if (existing.payment_status === 'Paid') {
            throw new common_1.BadRequestException('Payment already completed for this registration');
        }
        const { data, error } = await supabase
            .from('company_registrations')
            .update({
            subscription_plan: dto.subscription_plan,
            billing_cycle: dto.billing_cycle,
        })
            .eq('registration_id', dto.registration_id)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async getRegistrationStatus(registrationId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('company_registrations')
            .select('registration_id, payment_status, subscription_status, subscription_plan, company_name')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Registration not found');
        return data;
    }
    async createCheckout(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: registration, error: fetchErr } = await supabase
            .from('company_registrations')
            .select('registration_id, payment_status, subscription_plan, billing_cycle, company_name, email')
            .eq('registration_id', dto.registration_id)
            .maybeSingle();
        if (fetchErr)
            throw new common_1.InternalServerErrorException(fetchErr.message);
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        if (registration.payment_status === 'Paid') {
            throw new common_1.BadRequestException('Payment already completed for this registration');
        }
        const isAnnual = (registration.subscription_plan ?? registration.billing_cycle) === 'annual';
        const amountCentavos = isAnnual ? 2999900 : 299900;
        const planName = isAnnual ? 'Annual Plan' : 'Monthly Plan';
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const successUrl = `${appUrl}/payment/success?registration_id=${dto.registration_id}`;
        const cancelUrl = `${appUrl}/payment/cancel?registration_id=${dto.registration_id}`;
        const session = await this.apiCenterSdkService
            .getClient()
            .paymentCreateCheckoutSession({
            referenceId: dto.registration_id,
            idempotencyKey: dto.registration_id,
            successUrl,
            cancelUrl,
            lineItems: [
                {
                    name: planName,
                    quantity: 1,
                    amount: { value: amountCentavos, currency: 'PHP' },
                },
            ],
        })
            .catch((err) => {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`paymentCreateCheckoutSession failed: ${message}`);
            throw new common_1.InternalServerErrorException(`Payment gateway error: ${message}`);
        });
        const checkoutId = session.checkoutId;
        const checkoutUrl = session.redirectUrl;
        const { error: updateErr } = await supabase
            .from('company_registrations')
            .update({ checkout_id: checkoutId })
            .eq('registration_id', dto.registration_id);
        if (updateErr)
            throw new common_1.InternalServerErrorException(updateErr.message);
        return { checkout_url: checkoutUrl, checkout_id: checkoutId };
    }
    async confirmPayment(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: registration, error: fetchErr } = await supabase
            .from('company_registrations')
            .select('*')
            .eq('registration_id', dto.registration_id)
            .maybeSingle();
        if (fetchErr)
            throw new common_1.InternalServerErrorException(fetchErr.message);
        if (!registration)
            throw new common_1.NotFoundException('Registration not found');
        if (!registration.checkout_id) {
            throw new common_1.BadRequestException('Missing checkout session for this registration');
        }
        if (registration.payment_status === 'Paid') {
            if (registration.company_id) {
                return {
                    message: 'Already processed',
                    registration_id: dto.registration_id,
                };
            }
            await this.provisionTenant(registration);
            return {
                message: 'Payment already marked paid. Tenant provisioning completed.',
                registration_id: dto.registration_id,
            };
        }
        const MAX_ATTEMPTS = 5;
        const POLL_INTERVAL_MS = 2000;
        let checkoutSession;
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            checkoutSession = await this.apiCenterSdkService
                .getClient()
                .paymentGetCheckoutStatus(registration.checkout_id);
            if (checkoutSession.status === 'paid')
                break;
            if (i < MAX_ATTEMPTS - 1)
                await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        }
        if (checkoutSession.status !== 'paid') {
            const isDev = this.config.get('NODE_ENV') !== 'production';
            if (isDev) {
                this.logger.warn(`DEV MODE: Checkout status "${checkoutSession.status}" — trusting PayMongo successUrl redirect. Proceeding as paid.`);
            }
            else {
                throw new common_1.BadRequestException(`Checkout not paid yet. Current status: ${checkoutSession.status}`);
            }
        }
        const transactionId = checkoutSession.referenceId ??
            checkoutSession.checkoutId ??
            registration.checkout_id;
        const { error: paymentErr } = await supabase
            .from('company_registrations')
            .update({
            payment_status: 'Paid',
            payment_date: new Date().toISOString(),
            transaction_id: transactionId,
            subscription_status: 'Active',
        })
            .eq('registration_id', dto.registration_id);
        if (paymentErr)
            throw new common_1.InternalServerErrorException(paymentErr.message);
        await this.provisionTenant({ ...registration, payment_status: 'Paid' });
        return {
            message: 'Payment confirmed. Tenant provisioned.',
            registration_id: dto.registration_id,
        };
    }
    async provisionTenant(registration) {
        const supabase = this.supabaseService.getClient();
        const { data: freshReg } = await supabase
            .from('company_registrations')
            .select('company_id')
            .eq('registration_id', registration.registration_id)
            .single();
        if (freshReg?.company_id)
            return;
        const slug = generateSlug(registration.company_name);
        const { data: company, error: companyErr } = await supabase
            .from('company')
            .insert({ company_name: registration.company_name, slug })
            .select('company_id')
            .single();
        let company_id;
        if (companyErr) {
            if (companyErr.code === '23505') {
                const { data: existing, error: fetchErr } = await supabase
                    .from('company')
                    .select('company_id')
                    .eq('slug', slug)
                    .single();
                if (fetchErr || !existing) {
                    throw new common_1.InternalServerErrorException(`Company creation failed: ${companyErr.message}`);
                }
                await supabase
                    .from('company_registrations')
                    .update({ company_id: existing.company_id })
                    .eq('registration_id', registration.registration_id);
                return;
            }
            throw new common_1.InternalServerErrorException(`Company creation failed: ${companyErr.message}`);
        }
        company_id = company.company_id;
        await supabase
            .from('company_registrations')
            .update({ company_id })
            .eq('registration_id', registration.registration_id);
        await supabase.from('tenant_config').insert({
            company_id,
            timezone: 'Asia/Manila',
            date_format: 'MM/DD/YYYY',
            currency: 'PHP',
        });
        await supabase.from('tenant_modules').upsert(MODULES.map((module) => ({ company_id, module_name: module, status: 'Active' })), { onConflict: 'company_id,module_name' });
        const roleId = await this.getOrCreateSystemAdminRole(company_id);
        const user_id = crypto.randomUUID();
        const employee_id = `sa-${company_id.slice(0, 8)}`;
        const { error: userErr } = await supabase.from('user_profile').insert({
            user_id,
            email: registration.email,
            first_name: 'System',
            last_name: 'Admin',
            role_id: roleId,
            company_id,
            employee_id,
            username: null,
            password_hash: null,
            account_status: 'Pending',
        });
        if (userErr) {
            throw new common_1.InternalServerErrorException(`System Admin user creation failed: ${userErr.message}`);
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: inviteErr } = await supabase.from('user_invites').insert({
            invite_id: crypto.randomUUID(),
            user_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (inviteErr) {
            throw new common_1.InternalServerErrorException(`Invite creation failed: ${inviteErr.message}`);
        }
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const inviteLink = `${appUrl}/set-password?token=${rawToken}`;
        if (this.config.get('NODE_ENV') !== 'production') {
            this.logger.debug(`DEV MODE - System Admin invite | Email: ${registration.email} | Link: ${inviteLink}`);
        }
        this.mailService
            .sendPaymentConfirmation(registration.email, registration.company_name, registration.subscription_plan)
            .catch((err) => {
            this.logger.error(`Failed to send payment confirmation to ${registration.email}`, err);
        });
        this.mailService
            .sendSystemAdminCredentials(registration.email, inviteLink)
            .catch((err) => {
            this.logger.error(`Failed to send System Admin credentials to ${registration.email}`, err);
        });
        try {
            await supabase.from('admin_audit_logs').insert({
                action: `TENANT_PROVISIONED: ${registration.company_name} (${company_id})`,
                performed_by: null,
                company_id,
                target_user_id: user_id,
                severity: 'WARNING',
                ip_address: null,
            });
        }
        catch {
        }
    }
    async getOrCreateSystemAdminRole(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data: globalRole, error: globalRoleErr } = await supabase
            .from('role')
            .select('role_id')
            .is('company_id', null)
            .ilike('role_name', 'system admin')
            .limit(1)
            .maybeSingle();
        if (globalRoleErr) {
            throw new common_1.InternalServerErrorException(`Role lookup failed: ${globalRoleErr.message}`);
        }
        if (globalRole?.role_id) {
            return globalRole.role_id;
        }
        const { data: tenantRole, error: tenantRoleErr } = await supabase
            .from('role')
            .select('role_id')
            .eq('company_id', companyId)
            .ilike('role_name', 'system admin')
            .limit(1)
            .maybeSingle();
        if (tenantRoleErr) {
            throw new common_1.InternalServerErrorException(`Role lookup failed: ${tenantRoleErr.message}`);
        }
        if (tenantRole?.role_id) {
            return tenantRole.role_id;
        }
        const { data: insertedRole, error: insertRoleErr } = await supabase
            .from('role')
            .insert({
            role_name: 'System Admin',
            company_id: companyId,
        })
            .select('role_id')
            .single();
        if (insertRoleErr || !insertedRole?.role_id) {
            throw new common_1.InternalServerErrorException(`System Admin role creation failed: ${insertRoleErr?.message ?? 'Unknown error'}`);
        }
        return insertedRole.role_id;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService,
        config_1.ConfigService,
        api_center_1.ApiCenterSdkService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map