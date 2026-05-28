import type { AuthenticatedRequest } from '@app/common';
import { FileOvertimeRequestDto } from './dto/file-overtime-request.dto';
import { ReviewOvertimeRequestDto } from './dto/review-overtime-request.dto';
import { OvertimeService } from './overtime.service';
export declare class OvertimeController {
    private readonly overtimeService;
    constructor(overtimeService: OvertimeService);
    createOvertimeRequest(req: AuthenticatedRequest, dto: FileOvertimeRequestDto): Promise<{
        ot_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        ot_type: import("./dto/file-overtime-request.dto").OvertimeType;
        ot_date: string;
        start_time: string;
        end_time: string;
        planned_hours: number;
        reason: string | null;
        log_status: string;
    }>;
    getMyOvertimeRequests(req: AuthenticatedRequest): Promise<{
        ot_id: string;
        employee_id: string;
        ot_type: import("./dto/file-overtime-request.dto").OvertimeType;
        ot_date: string;
        start_time: string;
        end_time: string;
        planned_hours: number;
        reason: string | null;
        log_status: "PENDING" | "APPROVED" | "DENIED";
        latitude: number | null;
        longitude: number | null;
        ip_address: string | null;
        requested_by: string;
        created_at: string;
        reviewed_by: string | null;
        reviewed_at: string | null;
        review_reason: string | null;
    }[]>;
    getMyOvertimeSummary(req: AuthenticatedRequest, month?: string): Promise<{
        approved_planned_hours: number;
    }>;
    getOvertimeRequests(req: AuthenticatedRequest, status?: string, type?: string): Promise<{
        employee: {
            employee_id: any;
            user_id: any;
            first_name: any;
            last_name: any;
        } | null;
        employee_id: string;
    }[]>;
    reviewOvertimeRequest(otId: string, req: AuthenticatedRequest, dto: ReviewOvertimeRequestDto): Promise<{
        employee: {
            user_id: any;
            company_id: any;
            first_name: any;
            last_name: any;
            email: any;
            employee_id: any;
        };
        ot_id: string;
        employee_id: string;
        ot_type: import("./dto/file-overtime-request.dto").OvertimeType;
        ot_date: string;
        start_time: string;
        end_time: string;
        planned_hours: number;
        reason: string | null;
        log_status: "PENDING" | "APPROVED" | "DENIED";
        latitude: number | null;
        longitude: number | null;
        ip_address: string | null;
        requested_by: string;
        created_at: string;
        reviewed_by: string | null;
        reviewed_at: string | null;
        review_reason: string | null;
    }>;
}
