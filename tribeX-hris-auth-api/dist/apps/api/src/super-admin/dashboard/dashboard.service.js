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
exports.SuperAdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../../libs/supabase/src");
let SuperAdminDashboardService = class SuperAdminDashboardService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getStats() {
        const db = this.supabase.getClient();
        const [total, active, pending, suspended, expired] = await Promise.all([
            db.from('company').select('company_id', { count: 'exact', head: true }),
            db.from('company_registrations').select('registration_id', { count: 'exact', head: true })
                .ilike('subscription_status', 'active'),
            db.from('company_registrations').select('registration_id', { count: 'exact', head: true })
                .ilike('payment_status', 'pending'),
            db.from('company_registrations').select('registration_id', { count: 'exact', head: true })
                .ilike('subscription_status', 'suspended'),
            db.from('company_registrations').select('registration_id', { count: 'exact', head: true })
                .ilike('subscription_status', 'expired'),
        ]);
        return {
            total_companies: total.count ?? 0,
            active_subscriptions: active.count ?? 0,
            pending_approvals: pending.count ?? 0,
            suspended_count: suspended.count ?? 0,
            expired_count: expired.count ?? 0,
            monthly_revenue: null,
        };
    }
    async getPendingApprovals() {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('company_registrations')
            .select('registration_id, company_id, company_name, email, industry, subscription_plan, billing_cycle, registered_date')
            .ilike('payment_status', 'pending')
            .order('registered_date', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
};
exports.SuperAdminDashboardService = SuperAdminDashboardService;
exports.SuperAdminDashboardService = SuperAdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], SuperAdminDashboardService);
//# sourceMappingURL=dashboard.service.js.map