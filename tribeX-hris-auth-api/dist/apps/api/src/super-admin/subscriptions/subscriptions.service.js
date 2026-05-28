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
exports.SuperAdminSubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../../libs/supabase/src");
let SuperAdminSubscriptionsService = class SuperAdminSubscriptionsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    computeEndDate(paymentDate, billingCycle) {
        if (!paymentDate)
            return '';
        const d = new Date(paymentDate);
        if (billingCycle === 'annual')
            d.setFullYear(d.getFullYear() + 1);
        else
            d.setMonth(d.getMonth() + 1);
        return d.toISOString();
    }
    async list(query) {
        const db = this.supabase.getClient();
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const offset = (page - 1) * limit;
        let q = db
            .from('company_registrations')
            .select('registration_id, company_id, company_name, subscription_plan, billing_cycle, subscription_status, payment_status, payment_date, transaction_id', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('payment_date', { ascending: false });
        if (query.status)
            q = q.ilike('subscription_status', query.status);
        if (query.billing_cycle)
            q = q.eq('billing_cycle', query.billing_cycle);
        const { data, error, count } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const enriched = (data ?? []).map(r => ({
            ...r,
            start_date: r.payment_date,
            end_date: this.computeEndDate(r.payment_date, r.billing_cycle),
        }));
        return { data: enriched, total: count, page, limit };
    }
    async detail(registrationId) {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('company_registrations')
            .select('*')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Subscription not found');
        return {
            ...data,
            start_date: data.payment_date,
            end_date: this.computeEndDate(data.payment_date, data.billing_cycle),
        };
    }
    async updateStatus(registrationId, subscriptionStatus, performedBy) {
        const db = this.supabase.getClient();
        const { error } = await db
            .from('company_registrations')
            .update({ subscription_status: subscriptionStatus })
            .eq('registration_id', registrationId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await db.from('admin_audit_logs').insert({
            action: `SUBSCRIPTION_STATUS_UPDATE: ${registrationId} → ${subscriptionStatus}`,
            performed_by: performedBy,
            severity: 'INFO',
        });
        return { success: true };
    }
    async paymentHistory(registrationId) {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('company_registrations')
            .select('registration_id, payment_status, payment_date, transaction_id, billing_cycle, subscription_plan')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Subscription not found');
        return { records: [data], total: 1 };
    }
};
exports.SuperAdminSubscriptionsService = SuperAdminSubscriptionsService;
exports.SuperAdminSubscriptionsService = SuperAdminSubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], SuperAdminSubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map