import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    markAllRead(req: any): Promise<void>;
    getMyNotifications(req: any): Promise<any[]>;
    markRead(id: string, req: any): Promise<void>;
    createNotification(dto: CreateNotificationDto): Promise<any>;
    getUnreadNotifications(applicantId: string): Promise<any[]>;
    getAllNotifications(applicantId: string): Promise<any[]>;
    markAllAsRead(applicantId: string): Promise<{
        message: string;
    }>;
    markNotificationAsRead(notificationId: string): Promise<any>;
}
