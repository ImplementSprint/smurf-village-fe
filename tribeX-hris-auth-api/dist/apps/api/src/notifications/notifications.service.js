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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    supabaseService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createNotification(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: user } = await supabase
            .from('user_profile')
            .select('user_id, company_id')
            .eq('user_id', dto.userId)
            .maybeSingle();
        if (user?.user_id) {
            const { error } = await supabase
                .from('user_notifications')
                .insert({
                user_id: dto.userId,
                company_id: dto.companyId || user.company_id,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                metadata: dto.metadata ?? null,
            });
            if (error) {
                this.logger.error('[NotificationsService] Failed to create notification:', error.message);
            }
            return;
        }
        const { data: applicant } = await supabase
            .from('applicant_profile')
            .select('applicant_id')
            .eq('applicant_id', dto.userId)
            .maybeSingle();
        if (applicant?.applicant_id) {
            const jobPostingId = typeof dto.metadata?.job_posting_id === 'string' ? dto.metadata.job_posting_id : null;
            const { error } = await supabase
                .from('notifications')
                .insert({
                notification_id: crypto.randomUUID(),
                applicant_id: applicant.applicant_id,
                message: `${dto.title}: ${dto.message}`,
                type: dto.type || 'status_update',
                job_posting_id: jobPostingId,
                is_read: false,
                created_at: new Date().toISOString(),
            });
            if (error) {
                this.logger.error('[NotificationsService] Failed to create applicant notification:', error.message);
            }
            return;
        }
        this.logger.warn(`[NotificationsService] Notification skipped. Unknown recipient id: ${dto.userId}`);
    }
    async notifyAllHRInCompany(companyId, payload) {
        const { data: hrUsers, error } = await this.supabaseService
            .getClient()
            .from('user_profile')
            .select('user_id, role:role_id(role_name)')
            .eq('company_id', companyId);
        if (error) {
            this.logger.error('[NotificationsService] Failed to fetch HR users:', error.message);
            return;
        }
        const HR_ROLES = ['HR Officer', 'HR Recruiter', 'Admin', 'System Admin'];
        const targets = (hrUsers ?? []).filter((u) => HR_ROLES.includes(u.role?.role_name));
        for (const user of targets) {
            await this.createNotification({ userId: user.user_id, companyId, ...payload });
        }
    }
    async getForUser(userId, limit = 30) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            this.logger.error('[NotificationsService] Failed to fetch notifications:', error.message);
            return [];
        }
        return data ?? [];
    }
    async markRead(notificationId, userId) {
        const { error } = await this.supabaseService
            .getClient()
            .from('user_notifications')
            .update({ is_read: true })
            .eq('notification_id', notificationId)
            .eq('user_id', userId);
        if (error) {
            this.logger.error('[NotificationsService] Failed to mark notification read:', error.message);
        }
    }
    async markAllRead(userId) {
        const { error } = await this.supabaseService
            .getClient()
            .from('user_notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        if (error) {
            this.logger.error('[NotificationsService] Failed to mark all notifications read:', error.message);
        }
    }
    async createApplicantNotification(dto) {
        const supabase = this.supabaseService.getClient();
        const notification_id = crypto.randomUUID();
        const { data, error } = await supabase
            .from('notifications')
            .insert({
            notification_id,
            applicant_id: dto.applicant_id,
            message: dto.message,
            type: dto.notification_type ?? 'status_update',
            job_posting_id: dto.job_posting_id ?? null,
            is_read: false,
            created_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async getUnreadNotifications(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('applicant_id', applicantId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data ?? [];
    }
    async getAllNotifications(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('applicant_id', applicantId)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data ?? [];
    }
    async markNotificationAsRead(notificationId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('notification_id', notificationId)
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Notification not found');
        return data;
    }
    async markAllAsRead(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('applicant_id', applicantId)
            .eq('is_read', false);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: 'All notifications marked as read' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map