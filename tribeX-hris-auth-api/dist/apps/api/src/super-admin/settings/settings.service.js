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
exports.SuperAdminSettingsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../../libs/supabase/src");
let SuperAdminSettingsService = class SuperAdminSettingsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getProfile(adminId) {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('super_admin_users')
            .select('id, email, name, created_at')
            .eq('id', adminId)
            .maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Admin not found');
        return data;
    }
    async updateProfile(adminId, name) {
        const db = this.supabase.getClient();
        const { error } = await db.from('super_admin_users').update({ name }).eq('id', adminId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true };
    }
    async changePassword(adminId, adminEmail, currentPassword, newPassword) {
        const db = this.supabase.getClient();
        const { error: verifyError } = await db.auth.signInWithPassword({ email: adminEmail, password: currentPassword });
        if (verifyError)
            throw new common_1.BadRequestException('Current password is incorrect');
        const { error } = await db.auth.admin.updateUserById(adminId, { password: newPassword });
        if (error)
            throw new common_1.BadRequestException(error.message);
        await db.from('admin_audit_logs').insert({
            action: 'PASSWORD_CHANGE: super admin changed their password',
            performed_by: adminId,
            severity: 'INFO',
        });
        return { success: true };
    }
    async getNotifications(adminId) {
        const db = this.supabase.getClient();
        const { data } = await db.from('super_admin_settings').select('*').eq('admin_id', adminId).maybeSingle();
        return data ?? {
            admin_id: adminId,
            notify_new_signup: true, notify_payment: true,
            notify_renewal_due: true, notify_expiry: true,
        };
    }
    async updateNotifications(adminId, prefs) {
        const db = this.supabase.getClient();
        const { error } = await db.from('super_admin_settings').upsert({ admin_id: adminId, ...prefs, updated_at: new Date().toISOString() }, { onConflict: 'admin_id' });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { success: true };
    }
    async getAuditLog() {
        const db = this.supabase.getClient();
        const { data, error } = await db
            .from('admin_audit_logs')
            .select('id, action, performed_by, company_id, severity, created_at')
            .order('created_at', { ascending: false })
            .limit(25);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    getSystemSettings() {
        return { payment_gateway: null, credential_provisioning: null };
    }
};
exports.SuperAdminSettingsService = SuperAdminSettingsService;
exports.SuperAdminSettingsService = SuperAdminSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], SuperAdminSettingsService);
//# sourceMappingURL=settings.service.js.map