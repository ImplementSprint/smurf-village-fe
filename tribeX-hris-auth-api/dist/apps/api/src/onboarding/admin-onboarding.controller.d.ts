import { OnboardingService } from './onboarding.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { AssignTemplateDto } from './dto/assign-template.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
export declare class AdminOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
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
    getPositions(): Promise<any[]>;
    createPosition(body: {
        department_id: string;
        position_name: string;
    }): Promise<any>;
    getDepartments(): Promise<{
        department_id: any;
        department_name: any;
        company_id: any;
    }[]>;
    uploadTemplateImage(file: Express.Multer.File): Promise<{
        url: string;
        path: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }>;
    addTemplateItem(templateId: string, body: {
        type: string;
        tab_category: string;
        title: string;
        description?: string;
        is_required: boolean;
        rich_content?: string;
    }): Promise<any>;
    updateTemplateItem(itemId: string, body: {
        title?: string;
        description?: string;
        is_required?: boolean;
        rich_content?: string;
    }): Promise<any>;
    deleteTemplateItem(itemId: string): Promise<void>;
    uploadTrainingVideo(file: Express.Multer.File): Promise<{
        url: string;
        path: string;
        file_name: string;
        file_type: string;
        file_size: number;
    }>;
    createTrainingVideo(dto: CreateVideoDto, req: any): Promise<any>;
    getTrainingVideos(req: any, templateId?: string): Promise<any[]>;
    updateTrainingVideo(videoId: string, dto: UpdateVideoDto, req: any): Promise<any>;
    deleteTrainingVideo(videoId: string, req: any): Promise<void>;
}
