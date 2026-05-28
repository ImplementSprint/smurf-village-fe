import type { Request, Response } from 'express';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantLoginDto } from './dto/applicant-login.dto';
import { UploadSfiaResumeDto } from './dto/upload-sfia-resume.dto';
export declare class ApplicantsController {
    private readonly applicantsService;
    constructor(applicantsService: ApplicantsService);
    register(dto: CreateApplicantDto, companyId?: string): Promise<{
        applicant_id: `${string}-${string}-${string}-${string}-${string}`;
        applicant_code: string;
        email: string;
        first_name: string;
        last_name: string;
        message: string;
    }>;
    login(dto: ApplicantLoginDto, res: Response): Promise<{
        access_token: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        access_token: string;
    }>;
    logout(req: Request, res: Response, authHeader?: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<Record<string, any>>;
    updateMe(req: any, body: any): Promise<{
        applicant_id: any;
        first_name: any;
        middle_name: any;
        last_name: any;
        email: any;
        phone_number: any;
        personal_email: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        complete_address: any;
        avatar_url: any;
        resume_url: any;
        resume_name: any;
        resume_uploaded_at: any;
    } | {
        message: string;
    } | null>;
    uploadResume(req: any, file: Express.Multer.File): Promise<{
        resume_url: string;
        resume_name: string;
        resume_uploaded_at: string;
    }>;
    deleteResume(req: any): Promise<{
        message: string;
    }>;
    uploadSfiaResume(dto: UploadSfiaResumeDto, applicantIdParam?: string, req?: any): Promise<{
        file_name: string;
        storage_path: string;
        signed_url: string;
    }>;
}
