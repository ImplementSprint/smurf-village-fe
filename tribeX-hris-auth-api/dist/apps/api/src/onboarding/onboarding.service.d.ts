import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@app/supabase';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TimekeepingService } from '../timekeeping/timekeeping.service';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { SaveProfileDto } from './dto/save-profile.dto';
import { AssignTemplateDto } from './dto/assign-template.dto';
import { AddRemarkDto } from './dto/add-remark.dto';
export declare class OnboardingService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly config;
    private readonly auditService;
    private readonly notificationsService;
    private readonly timekeepingService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mailService: MailService, config: ConfigService, auditService: AuditService, notificationsService: NotificationsService, timekeepingService: TimekeepingService);
    private normalizeDocType;
    private getSessionContext;
    private getRemarkTabTagCandidates;
    getMySession(accountId: string, sessionId?: string): Promise<{
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
    uploadDocument(onboardingItemId: string, file: Express.Multer.File, isProofOfReceipt?: boolean): Promise<any>;
    uploadTemplateImage(file: Express.Multer.File): Promise<{
        url: string;
        path: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }>;
    uploadTrainingVideo(file: Express.Multer.File): Promise<{
        url: string;
        path: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }>;
    confirmTask(onboardingItemId: string): Promise<{
        message: string;
        onboarding_item_id: string;
        status: string;
    }>;
    saveProfile(sessionId: string, dto: SaveProfileDto): Promise<any>;
    submitForReview(sessionId: string, applicantId?: string): Promise<{
        message: string;
        session_id: string;
        status: string;
    }>;
    getAllOnboardingSessions(includeDeclined?: boolean): Promise<any[]>;
    getSessionById(sessionId: string): Promise<{
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
    updateItemStatus(onboardingItemId: string, dto: UpdateTaskStatusDto, authorId?: string): Promise<{
        message: string;
        onboarding_item_id: string;
        status: import("./dto/update-task-status.dto").ItemStatusEnum;
    }>;
    addRemark(dto: AddRemarkDto, authorId: string): Promise<any>;
    approveSession(sessionId: string, hrUserId?: string): Promise<{
        message: string;
        session_id: string;
        status: string;
    }>;
    rejectSession(sessionId: string, reason: string, hrUserId?: string): Promise<{
        message: string;
        session_id: string;
        status: string;
        reason: string;
    }>;
    createTemplate(dto: CreateTemplateDto): Promise<{
        message: string;
        template_id: `${string}-${string}-${string}-${string}-${string}`;
        name: string;
        items_count: number;
    }>;
    getAllTemplates(): Promise<any[]>;
    assignTemplate(dto: AssignTemplateDto): Promise<{
        message: string;
        session_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    requestEquipment(onboardingItemId: string, dto: {
        is_requested: boolean;
        delivery_method: 'office' | 'delivery';
        delivery_address?: string;
    }): Promise<{
        message: string;
        onboarding_item_id: string;
    }>;
    getAllPositions(): Promise<any[]>;
    createPosition(dto: {
        department_id: string;
        position_name: string;
    }): Promise<any>;
    addTemplateItem(templateId: string, dto: {
        type: string;
        tab_category: string;
        title: string;
        description?: string;
        is_required: boolean;
        rich_content?: string;
    }): Promise<any>;
    deleteTemplateItem(itemId: string): Promise<void>;
    updateTemplateItem(itemId: string, dto: {
        title?: string;
        description?: string;
        is_required?: boolean;
        rich_content?: string;
    }): Promise<any>;
    getDepartments(): Promise<{
        department_id: any;
        department_name: any;
        company_id: any;
    }[]>;
    updateSessionDeadline(sessionId: string, deadlineDate: string): Promise<{
        session_id: string;
        deadline_date: string;
    }>;
    private recalculateProgress;
    createOnboardingRecord(params: {
        applicationId: string;
        applicantId: string;
        jobPostingId: string;
        companyId: string;
    }): Promise<{
        submission_id: any;
    }>;
    getMyOnboarding(applicantId: string): Promise<any>;
    saveOnboarding(applicantId: string, body: Record<string, any>): Promise<any>;
    submitOnboarding(applicantId: string): Promise<any>;
    getHROnboardingSubmissions(companyId: string, statusFilter?: string): Promise<any[]>;
    getHROnboardingSubmission(submissionId: string, companyId: string): Promise<any>;
    approveOnboardingSubmission(submissionId: string, roleId: string, companyId: string, reviewerUserId?: string): Promise<{
        user_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        email: any;
        invite_expires_at: string;
    }>;
    rejectOnboardingSubmission(submissionId: string, hrNotes: string, companyId: string, reviewerUserId?: string): Promise<{
        message: string;
    }>;
    getSessionByApplicantId(applicantId: string): Promise<{
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
    createApplicantSession(params: {
        applicantId: string;
        jobPostingId: string;
        companyId: string;
    }): Promise<{
        session_id: any;
    } | null>;
    createTrainingVideo(companyId: string, dto: import('./dto/create-video.dto').CreateVideoDto, createdBy: string): Promise<any>;
    getTrainingVideos(companyId: string, templateId?: string): Promise<any[]>;
    updateTrainingVideo(videoId: string, companyId: string, dto: import('./dto/update-video.dto').UpdateVideoDto): Promise<any>;
    deleteTrainingVideo(videoId: string, companyId: string): Promise<void>;
    getApplicantTrainingVideos(applicantId: string): Promise<any[]>;
    saveVideoProgress(applicantId: string, videoId: string, dto: import('./dto/save-video-progress.dto').SaveVideoProgressDto): Promise<any>;
    acceptOffer(sessionId: string, applicantId: string): Promise<{
        message: string;
    }>;
    declineOffer(sessionId: string, applicantId: string): Promise<{
        message: string;
    }>;
}
