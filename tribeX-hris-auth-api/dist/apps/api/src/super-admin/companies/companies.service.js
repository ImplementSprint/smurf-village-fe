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
exports.SuperAdminCompaniesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../../libs/supabase/src");
let SuperAdminCompaniesService = class SuperAdminCompaniesService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async list(query) {
        const db = this.supabase.getClient();
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const offset = (page - 1) * limit;
        let q = db
            .from('company_registrations')
            .select(`registration_id, company_id, company_name, email, industry,
         subscription_plan, subscription_status, payment_status,
         billing_cycle, payment_date, transaction_id,
         company(company_name, slug)`, { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('registered_date', { ascending: false });
        if (query.status)
            q = q.ilike('subscription_status', query.status);
        if (query.plan)
            q = q.eq('subscription_plan', query.plan);
        if (query.industry)
            q = q.ilike('industry', `%${query.industry}%`);
        if (query.from)
            q = q.gte('payment_date', query.from);
        if (query.to)
            q = q.lte('payment_date', query.to);
        const { data, error, count } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { data, total: count, page, limit };
    }
    async detail(companyId) {
        const db = this.supabase.getClient();
        const [reg, config, modules] = await Promise.all([
            db.from('company_registrations').select('*').eq('company_id', companyId).maybeSingle(),
            db.from('tenant_config').select('*').eq('company_id', companyId).maybeSingle(),
            db.from('tenant_modules').select('*').eq('company_id', companyId),
        ]);
        if (!reg.data)
            throw new common_1.NotFoundException('Company not found');
        return { registration: reg.data, config: config.data, modules: modules.data };
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
            action: `STATUS_UPDATE: registration ${registrationId} → ${subscriptionStatus}`,
            performed_by: performedBy,
            severity: 'INFO',
        });
        return { success: true };
    }
    async provision(registrationId, performedBy) {
        const db = this.supabase.getClient();
        const { data: reg, error } = await db
            .from('company_registrations')
            .select('*')
            .eq('registration_id', registrationId)
            .maybeSingle();
        if (error || !reg)
            throw new common_1.NotFoundException('Registration not found');
        if (reg.company_id)
            throw new common_1.BadRequestException('Company already provisioned');
        const companyId = crypto.randomUUID();
        const slug = reg.company_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        await db.from('company').insert({ company_id: companyId, company_name: reg.company_name, slug });
        await db.from('company_registrations')
            .update({ company_id: companyId, status: 'Provisioned' })
            .eq('registration_id', registrationId);
        await db.from('tenant_config').insert({
            company_id: companyId, timezone: 'Asia/Manila', date_format: 'MM/DD/YYYY', currency: 'PHP',
        });
        await db.from('admin_audit_logs').insert({
            action: `PROVISION: ${reg.company_name} (${companyId}) — registration ${registrationId}`,
            performed_by: performedBy,
            company_id: companyId,
            severity: 'INFO',
        });
        return { company_id: companyId };
    }
};
exports.SuperAdminCompaniesService = SuperAdminCompaniesService;
exports.SuperAdminCompaniesService = SuperAdminCompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], SuperAdminCompaniesService);
//# sourceMappingURL=companies.service.js.map