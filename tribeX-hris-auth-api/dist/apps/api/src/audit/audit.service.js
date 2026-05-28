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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../libs/supabase/src");
let AuditService = class AuditService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async resolveUserId(userId) {
        if (!userId)
            return null;
        const { data } = await this.supabaseService
            .getClient()
            .from('user_profile')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();
        return data?.user_id ?? null;
    }
    async log(action, performedBy, companyId, targetUserId) {
        const [safePerformedBy, safeTargetUserId] = await Promise.all([
            this.resolveUserId(performedBy),
            this.resolveUserId(targetUserId),
        ]);
        const { error } = await this.supabaseService
            .getClient()
            .from('admin_audit_logs')
            .insert({
            action,
            performed_by: safePerformedBy,
            company_id: companyId,
            target_user_id: safeTargetUserId,
            severity: 'INFO',
        });
        if (error) {
            console.error('[AuditService] Failed to write audit log:', error.message);
        }
    }
    async logIncident(action, severity, options) {
        const [safePerformedBy, safeTargetUserId] = await Promise.all([
            this.resolveUserId(options?.performedBy),
            this.resolveUserId(options?.targetUserId),
        ]);
        const { error } = await this.supabaseService
            .getClient()
            .from('admin_audit_logs')
            .insert({
            action,
            performed_by: safePerformedBy,
            company_id: options?.companyId ?? null,
            target_user_id: safeTargetUserId,
            severity,
            ip_address: options?.ipAddress ?? null,
        });
        if (error) {
            console.error('[AuditService] Failed to write incident log:', error.message);
        }
    }
    async getLogs(companyId, limit = 50, offset = 0) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('admin_audit_logs')
            .select('*, performer:user_profile!admin_audit_logs_performed_by_fkey(first_name, last_name)')
            .eq('company_id', companyId)
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data ?? [];
    }
    async getLogsCount(companyId) {
        const { count, error } = await this.supabaseService
            .getClient()
            .from('admin_audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { count: count ?? 0 };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], AuditService);
//# sourceMappingURL=audit.service.js.map