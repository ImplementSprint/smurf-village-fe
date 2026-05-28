import { OnboardingService } from './onboarding.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { SaveProfileDto } from './dto/save-profile.dto';
import { SaveVideoProgressDto } from './dto/save-video-progress.dto';
export declare class ApplicantPortalOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    getMySession(req: any): Promise<{
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
    uploadDocument(dto: UploadDocumentDto, file: Express.Multer.File, isProofOfReceipt?: string): Promise<any>;
    confirmTask(onboardingItemId: string): Promise<{
        message: string;
        onboarding_item_id: string;
        status: string;
    }>;
    saveProfile(sessionId: string, dto: SaveProfileDto): Promise<any>;
    submitForReview(sessionId: string, req: any): Promise<{
        message: string;
        session_id: string;
        status: string;
    }>;
    requestEquipment(onboardingItemId: string, body: {
        is_requested: boolean;
        delivery_method: 'office' | 'delivery';
        delivery_address?: string;
    }): Promise<{
        message: string;
        onboarding_item_id: string;
    }>;
    getTrainingVideos(req: any): Promise<any[]>;
    saveVideoProgress(videoId: string, dto: SaveVideoProgressDto, req: any): Promise<any>;
}
