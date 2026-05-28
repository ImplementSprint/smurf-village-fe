import { SupabaseService } from '@app/supabase';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    createNotification(dto: {
        userId: string;
        companyId: string;
        type: string;
        title: string;
        message: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    notifyAllHRInCompany(companyId: string, payload: {
        type: string;
        title: string;
        message: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    getForUser(userId: string, limit?: number): Promise<any[]>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    createApplicantNotification(dto: CreateNotificationDto): Promise<any>;
    getUnreadNotifications(applicantId: string): Promise<any[]>;
    getAllNotifications(applicantId: string): Promise<any[]>;
    markNotificationAsRead(notificationId: string): Promise<any>;
    markAllAsRead(applicantId: string): Promise<{
        message: string;
    }>;
}
