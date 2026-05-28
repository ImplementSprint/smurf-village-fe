import { SupabaseService } from '@app/supabase';
import { FileLeaveRequestDto } from './dto/file-leave-request.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import { MailService } from '../mail/mail.service';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
export declare class LeaveService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly leaveBalancesService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mailService: MailService, leaveBalancesService: LeaveBalancesService);
    getMyLeaveBalances(userId: string, companyId: string): Promise<{
        type: string;
        remaining: number;
        total: number;
    }[]>;
    fileLeaveRequest(userId: string, companyId: string, dto: FileLeaveRequestDto): Promise<any>;
    getMyLeaveRequests(userId: string): Promise<any[]>;
    getLeaveRequests(companyId: string, status?: string): Promise<any[]>;
    reviewLeaveRequest(requestId: string, reviewerId: string, companyId: string, dto: ReviewLeaveRequestDto): Promise<any>;
    cancelPendingLeave(requestId: string, userId: string): Promise<{
        success: boolean;
    }>;
    requestLeaveRevocation(requestId: string, userId: string, reason: string): Promise<{
        success: boolean;
    }>;
    reviewLeaveRevocation(requestId: string, reviewerId: string, companyId: string, action: 'approve' | 'reject'): Promise<{
        success: boolean;
        action: "approve" | "reject";
    }>;
    private backfillAttendanceForLeave;
    private deductLeaveBalance;
    private refundLeaveBalance;
    uploadLeaveAttachment(userId: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    seedLeaveBalancesForNewEmployee(userId: string, companyId: string): Promise<void>;
}
