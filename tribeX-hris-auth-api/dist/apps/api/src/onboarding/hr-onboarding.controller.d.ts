import { OnboardingService } from './onboarding.service';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AddRemarkDto } from './dto/add-remark.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';
import { RejectSessionDto } from './dto/reject-session.dto';
export declare class HrOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    getAllSessions(includeDeclined?: string): Promise<any[]>;
    getSession(sessionId: string): Promise<{
        session_id: any;
        account_id: any;
        template_id: any;
        template_name: any;
        employee_name: string | null;
        employee_id: any;
        assigned_position: any;
        assigned_department: any;
        offer_status: any;
        status: any;
        progress_percentage: any;
        deadline_date: any;
        completed_at: any;
        documents: any[];
        tasks: any[];
        equipment: any[];
        hr_forms: any[];
        profile_items: any[];
        welcome: any[];
        profile: any;
        remarks: {
            remark_id: any;
            tab_tag: any;
            remark_text: any;
            created_at: any;
            author: string;
        }[];
    } | null>;
    updateItemStatus(onboardingItemId: string, dto: UpdateTaskStatusDto, req: any): Promise<{
        message: string;
        onboarding_item_id: string;
        status: import("./dto/update-task-status.dto").ItemStatusEnum;
    }>;
    addRemark(dto: AddRemarkDto, req: any): Promise<any>;
    updateDeadline(sessionId: string, dto: UpdateDeadlineDto): Promise<{
        session_id: string;
        deadline_date: string;
    }>;
    approveSession(sessionId: string, req: any): Promise<{
        message: string;
        session_id: string;
        status: string;
    }>;
    rejectSession(sessionId: string, dto: RejectSessionDto, req: any): Promise<{
        message: string;
        session_id: string;
        status: string;
        reason: string;
    }>;
}
