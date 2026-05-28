import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '@app/supabase';
import { MailService } from '../mail/mail.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantLoginDto } from './dto/applicant-login.dto';
import { UploadSfiaResumeDto } from './dto/upload-sfia-resume.dto';
export declare class ApplicantsService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly config;
    private readonly jwtService;
    private readonly sfiaResumeBucket;
    constructor(supabaseService: SupabaseService, mailService: MailService, config: ConfigService, jwtService: JwtService);
    register(dto: CreateApplicantDto, companyId?: string): Promise<{
        applicant_id: `${string}-${string}-${string}-${string}-${string}`;
        applicant_code: string;
        email: string;
        first_name: string;
        last_name: string;
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    login(dto: ApplicantLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        refresh_max_age_ms: number;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        refresh_max_age_ms: number;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    getMe(applicantId: string): Promise<Record<string, any>>;
    uploadResume(applicantId: string, file: Express.Multer.File): Promise<{
        resume_url: string;
        resume_name: string;
        resume_uploaded_at: string;
    }>;
    deleteResume(applicantId: string): Promise<{
        message: string;
    }>;
    updateMe(applicantId: string, body: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        phone_number?: string;
        personal_email?: string;
        date_of_birth?: string;
        place_of_birth?: string;
        nationality?: string;
        civil_status?: string;
        complete_address?: string;
        avatar_url?: string;
    }): Promise<{
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
    logout(refreshToken: string, accessToken?: string): Promise<void>;
    uploadSfiaResume(applicantId: string, dto: UploadSfiaResumeDto): Promise<{
        file_name: string;
        storage_path: string;
        signed_url: string;
    }>;
    private ensureResumeBucket;
}
