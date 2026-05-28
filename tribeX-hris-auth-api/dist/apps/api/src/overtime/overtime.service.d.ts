import { MailService } from '../mail/mail.service';
import { SupabaseService } from '@app/supabase';
import { FileOvertimeRequestDto, OvertimeType } from './dto/file-overtime-request.dto';
import { ReviewOvertimeRequestDto } from './dto/review-overtime-request.dto';
type OvertimeRow = {
    ot_id: string;
    employee_id: string;
    ot_type: OvertimeType;
    ot_date: string;
    start_time: string;
    end_time: string;
    planned_hours: number;
    reason: string | null;
    log_status: 'PENDING' | 'APPROVED' | 'DENIED';
    latitude: number | null;
    longitude: number | null;
    ip_address: string | null;
    requested_by: string;
    created_at: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_reason: string | null;
};
export declare class OvertimeService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mailService: MailService);
    private getEmployeeId;
    private getScheduleForEmployee;
    createOvertimeRequest(userId: string, dto: FileOvertimeRequestDto, req?: unknown): Promise<{
        ot_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        ot_type: OvertimeType;
        ot_date: string;
        start_time: string;
        end_time: string;
        planned_hours: number;
        reason: string | null;
        log_status: string;
    }>;
    getMyOvertimeRequests(userId: string): Promise<OvertimeRow[]>;
    getMyOvertimeSummary(userId: string, month?: string): Promise<{
        approved_planned_hours: number;
    }>;
    getOvertimeRequests(companyId: string, status?: string, type?: string): Promise<{
        employee: {
            employee_id: any;
            user_id: any;
            first_name: any;
            last_name: any;
        } | null;
        employee_id: string;
    }[]>;
    reviewOvertimeRequest(otId: string, dto: ReviewOvertimeRequestDto, companyId: string, reviewerUserId: string): Promise<{
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
        ot_type: OvertimeType;
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
export {};
