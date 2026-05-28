import { LeaveService } from './leave.service';
import { FileLeaveRequestDto } from './dto/file-leave-request.dto';
import { ReviewLeaveRequestDto } from './dto/review-leave-request.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    getMyBalances(req: AuthenticatedRequest): Promise<{
        type: string;
        remaining: number;
        total: number;
    }[]>;
    fileLeaveRequest(req: AuthenticatedRequest, dto: FileLeaveRequestDto): Promise<any>;
    getMyLeaveRequests(req: AuthenticatedRequest): Promise<any[]>;
    cancelPendingLeave(requestId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    requestLeaveRevocation(requestId: string, req: AuthenticatedRequest, body: {
        reason: string;
    }): Promise<{
        success: boolean;
    }>;
    uploadAttachment(req: AuthenticatedRequest, file: Express.Multer.File): Promise<{
        url: string;
    }>;
    getLeaveRequests(req: AuthenticatedRequest, status?: string): Promise<any[]>;
    reviewLeaveRequest(requestId: string, req: AuthenticatedRequest, dto: ReviewLeaveRequestDto): Promise<any>;
    reviewLeaveRevocation(requestId: string, req: AuthenticatedRequest, body: {
        action: 'approve' | 'reject';
    }): Promise<{
        success: boolean;
        action: "approve" | "reject";
    }>;
}
