"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRenewalsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../../libs/supabase/src");
const mail_service_1 = require("../../mail/mail.service");
let SuperAdminRenewalsService = class SuperAdminRenewalsService {
    supabase;
    mail;
    constructor(supabase, mail) {
        this.supabase = supabase;
        this.mail = mail;
    }
    computeEndDate(paymentDate, billingCycle) {
        const d = new Date(paymentDate);
        if (billingCycle === 'annual')
            d.setFullYear(d.getFullYear() + 1);
        else
            d.setMonth(d.getMonth() + 1);
        return d;
    }
    getRenewalStatus(endDate) {
        const now = new Date();
        const diff = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let status;
        if (diff < 0)
            status = 'Expired';
        else if (diff <= 30)
            status = 'Due Soon';
        else
            status = 'Upcoming';
        return { status, daysRemaining: diff };
    }
    async list(statusFilter) {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('company_registrations')
            .select('registration_id, company_id, company_name, subscription_plan, billing_cycle, payment_date, email, subscription_status')
            .or('subscription_status.ilike.active,subscription_status.ilike.expired');
        if (error)
            throw new common_1.BadRequestException(error.message);
        const enriched = (data ?? [])
            .map(r => {
            if (!r.payment_date)
                return null;
            const endDate = this.computeEndDate(r.payment_date, r.billing_cycle);
            const { status, daysRemaining } = this.getRenewalStatus(endDate);
            return { ...r, end_date: endDate.toISOString(), days_remaining: daysRemaining, renewal_status: status };
        })
            .filter(Boolean);
        if (statusFilter) {
            const filterMap = {
                upcoming: 'Upcoming', due_soon: 'Due Soon', expired: 'Expired',
            };
            const target = filterMap[statusFilter.toLowerCase()];
            return enriched.filter(r => r.renewal_status === target);
        }
        return enriched;
    }
    async sendReminder(registrationId, performedBy) {
        const db = this.supabase.getClient();
        const { data: reg } = await db
            .from('company_registrations')
            .select('registration_id, company_name, subscription_plan, billing_cycle, payment_date, email')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recent } = await db
            .from('renewal_reminders')
            .select('id')
            .eq('registration_id', registrationId)
            .gte('sent_at', since)
            .limit(1);
        if (recent && recent.length > 0) {
            throw new common_1.HttpException('Reminder already sent within the last 24 hours', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const endDate = this.computeEndDate(reg.payment_date, reg.billing_cycle);
        const { daysRemaining } = this.getRenewalStatus(endDate);
        await this.mail.sendRenewalReminder(reg.email, reg.company_name, daysRemaining, reg.subscription_plan);
        await db.from('renewal_reminders').insert({ registration_id: registrationId, sent_by: performedBy });
        await db.from('admin_audit_logs').insert({
            action: `RENEWAL_REMINDER: sent to ${reg.email} for ${reg.company_name} (${daysRemaining} days)`,
            performed_by: performedBy,
            severity: 'INFO',
        });
        return { success: true, days_remaining: daysRemaining };
    }
    async markRenewed(registrationId, billingCycle, performedBy) {
        const db = this.supabase.getClient();
        const now = new Date().toISOString();
        const { error } = await db
            .from('company_registrations')
            .update({ subscription_status: 'Active', payment_status: 'Paid', payment_date: now, billing_cycle: billingCycle })
            .eq('registration_id', registrationId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await db.from('admin_audit_logs').insert({
            action: `MARK_RENEWED: ${registrationId} — billing_cycle=${billingCycle}, payment_date=${now}`,
            performed_by: performedBy,
            severity: 'INFO',
        });
        return { success: true };
    }
    async suspend(registrationId, performedBy) {
        const db = this.supabase.getClient();
        const { data: reg } = await db
            .from('company_registrations')
            .select('email, company_name')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        const { error } = await db
            .from('company_registrations')
            .update({ subscription_status: 'Suspended' })
            .eq('registration_id', registrationId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.mail.sendSuspensionNotice(reg.email, reg.company_name);
        await db.from('admin_audit_logs').insert({
            action: `SUSPEND_FROM_RENEWALS: ${registrationId} (${reg.company_name})`,
            performed_by: performedBy,
            severity: 'WARNING',
        });
        return { success: true };
    }
};
exports.SuperAdminRenewalsService = SuperAdminRenewalsService;
exports.SuperAdminRenewalsService = SuperAdminRenewalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService])
], SuperAdminRenewalsService);
//# sourceMappingURL=renewals.service.js.map