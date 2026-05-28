import { SupabaseService } from '@app/supabase';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationQuestionDto } from './dto/create-questions.dto';
import { ApplicationResumeUploadDto } from './dto/application-resume-upload.dto';
import { GetRankedCandidatesDto } from './dto/get-ranked-candidates.dto';
import { ManualRankingItemDto } from './dto/save-manual-ranking.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { InterviewResponseDto } from './dto/interview-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { OnboardingService } from '../onboarding/onboarding.service';
type RankingMode = 'sfia' | 'manual';
type SkillBreakdown = {
    sfia_skill_id: string;
    skill_name: string;
    demand_level: number;
    supply_level: number;
    points: number;
    matched: boolean;
};
type ApplicantProfileRow = {
    applicant_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    applicant_code: string | null;
};
export declare class JobsService {
    private readonly supabaseService;
    private readonly auditService;
    private readonly mailService;
    private readonly onboardingService;
    private readonly notificationsService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, auditService: AuditService, mailService: MailService, onboardingService: OnboardingService, notificationsService: NotificationsService);
    createPosting(dto: CreateJobPostingDto, companyId: string, performedBy: string): Promise<any>;
    findAllPostings(companyId: string): Promise<any[]>;
    findOnePosting(jobPostingId: string, companyId: string): Promise<any>;
    listSfiaSkills(): Promise<{
        skill_id: string;
        skill: string;
        category: string | null;
        level_1_desc: string | null;
        level_2_desc: string | null;
        level_3_desc: string | null;
        level_4_desc: string | null;
        level_5_desc: string | null;
        level_6_desc: string | null;
        level_7_desc: string | null;
    }[]>;
    suggestSfiaSkillsFromJobDescription(jobPostingId: string, companyId: string): Promise<{
        skill_id: string;
        skill_name: string;
        suggested_level: number;
    }[]>;
    getJobSfiaRequirementsForApplicant(jobPostingId: string): Promise<{
        skill_id: string;
        skill_name: string;
        required_level: number;
    }[]>;
    getJobSfiaSkills(jobPostingId: string, companyId: string): Promise<{
        job_posting_skills_id: any;
        skill_id: any;
        required_level: any;
        weight: any;
    }[]>;
    saveJobSfiaSkills(jobPostingId: string, skills: Array<{
        skill_id: string;
        required_level: number;
        weight?: number;
    }>, companyId: string): Promise<{
        job_posting_skills_id: any;
        skill_id: any;
        required_level: any;
        weight: any;
    }[]>;
    updatePosting(jobPostingId: string, dto: UpdateJobPostingDto, companyId: string, performedBy: string): Promise<any>;
    closePosting(jobPostingId: string, companyId: string, performedBy: string): Promise<{
        message: string;
    }>;
    setQuestionsForPosting(jobPostingId: string, questions: ApplicationQuestionDto[], companyId: string, performedBy: string): Promise<any[]>;
    getQuestionsForPosting(jobPostingId: string): Promise<{
        question_id: any;
        question_text: any;
        question_type: any;
        options: any;
        is_required: any;
        sort_order: any;
    }[]>;
    getApplicationsForJob(jobPostingId: string, companyId: string, includePast?: boolean): Promise<({
        application_id: any;
        status: any;
        applied_at: any;
        applicant_id: any;
        offer_deadline: any;
        applicant_profile: {
            first_name: any;
            last_name: any;
            email: any;
            phone_number: any;
            applicant_code: any;
            status: any;
        }[];
    } | {
        application_id: string;
        status: string;
        applied_at: string;
        applicant_id: string;
        applicant_profile: ApplicantProfileRow | null;
    })[]>;
    getRankedCandidates(jobPostingId: string, companyId: string, query: GetRankedCandidatesDto): Promise<{
        job_posting_id: string;
        title: any;
        ranking_mode: RankingMode;
        total_candidates: number;
        top_count: number;
        required_skill_count: number;
        candidates: {
            effective_rank: number;
            application_id: string;
            applicant_id: string;
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string | null;
            applicant_code: string | null;
            status: string;
            applied_at: string;
            sfia_match_percentage: number;
            sfia_rank: number;
            manual_rank_position: number | null;
            skill_breakdown: SkillBreakdown[];
        }[];
    }>;
    saveManualRanking(jobPostingId: string, companyId: string, performedBy: string, rankings: ManualRankingItemDto[]): Promise<{
        message: string;
        job_posting_id: string;
        updated_count: number;
    }>;
    getApplicationDetail(applicationId: string, companyId: string): Promise<{
        answers: {
            answer_id: any;
            answer_value: any;
            application_questions: {
                question_id: any;
                question_text: any;
                question_type: any;
                options: any;
                sort_order: any;
            }[];
        }[];
        interview_schedule: {
            application_id: any;
            stage: any;
            scheduled_date: any;
            scheduled_time: any;
            duration_minutes: any;
            format: any;
            location: any;
            meeting_link: any;
            interviewer_name: any;
            interviewer_title: any;
            notes: any;
            created_at: any;
            applicant_response: any;
            applicant_response_note: any;
            applicant_responded_at: any;
        };
        interview_schedules: Record<string, any>;
        survey_score: number | null;
        sfia_grade: number | null;
        sfia_match_percentage: number | null;
        resume_upload: ApplicationResumeUploadDto | null;
        application_id?: any;
        applicant_id?: any;
        status?: any;
        applied_at?: any;
        job_posting_id?: any;
        applicant_profile?: {
            first_name: any;
            last_name: any;
            email: any;
            phone_number: any;
            applicant_code: any;
            resume_url: any;
            resume_name: any;
            resume_uploaded_at: any;
        }[] | undefined;
    }>;
    updateApplicationStatus(applicationId: string, status: string, companyId: string, rejectionReason?: string, dto?: UpdateApplicationStatusDto): Promise<{
        message: string;
    }>;
    scheduleInterview(applicationId: string, dto: ScheduleInterviewDto, companyId: string): Promise<{
        message: string;
        schedule_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    cancelInterviewSchedule(applicationId: string, stage: string, companyId: string, reason?: string): Promise<{
        message: string;
    }>;
    resendInterviewEmail(applicationId: string, companyId: string): Promise<{
        message: string;
    }>;
    getMyInterviewSchedules(applicantId: string): Promise<{
        job_title: any;
        application_status: any;
        schedule_id: any;
        application_id: any;
        stage: any;
        scheduled_date: any;
        scheduled_time: any;
        duration_minutes: any;
        format: any;
        location: any;
        meeting_link: any;
        interviewer_name: any;
        interviewer_title: any;
        notes: any;
        created_at: any;
        applicant_response: any;
        applicant_response_note: any;
        applicant_responded_at: any;
    }[]>;
    respondToInterview(applicationId: string, applicantId: string, dto: InterviewResponseDto): Promise<{
        message: string;
    }>;
    getHRInterviewCalendar(companyId: string): Promise<{
        schedule_id: any;
        application_id: any;
        scheduled_date: any;
        scheduled_time: any;
        duration_minutes: any;
        format: any;
        location: any;
        meeting_link: any;
        interviewer_name: any;
        interviewer_title: any;
        applicant_response: any;
        created_at: any;
        application_status: any;
        job_title: any;
        job_posting_id: any;
        first_name: any;
        last_name: any;
        email: any;
    }[]>;
    getHRInterviewNotifications(companyId: string): Promise<{
        schedule_id: any;
        application_id: any;
        scheduled_date: any;
        scheduled_time: any;
        format: any;
        interviewer_name: any;
        applicant_response: any;
        applicant_response_note: any;
        applicant_responded_at: any;
        job_title: any;
        first_name: any;
        last_name: any;
        email: any;
    }[]>;
    getSurveyScore(applicationId: string): Promise<{
        applicationId: any;
        applicantId: any;
        surveyScore: number;
    }>;
    private calculateSurveyScore;
    getPublicCareersBySlug(slug: string): Promise<{
        company_id: any;
        company_name: any;
        company_display_name: string | null;
        company_logo_url: string | null;
        slug: any;
        jobs: {
            job_posting_id: any;
            title: any;
            description: any;
            location: any;
            employment_type: any;
            salary_range: any;
            posted_at: any;
            closes_at: any;
        }[];
    }>;
    getOpenJobsForApplicant(companyId: string | null): Promise<any[]>;
    applyToJob(jobPostingId: string, applicantId: string, companyId: string | null, dto: CreateApplicationDto): Promise<any>;
    getMyApplicationDetail(applicationId: string, applicantId: string): Promise<{
        answers: {
            answer_id: any;
            answer_value: any;
            application_questions: {
                question_id: any;
                question_text: any;
                question_type: any;
                options: any;
                sort_order: any;
            }[];
        }[];
        interview_schedule: {
            schedule_id: any;
            application_id: any;
            stage: any;
            scheduled_date: any;
            scheduled_time: any;
            duration_minutes: any;
            format: any;
            location: any;
            meeting_link: any;
            interviewer_name: any;
            interviewer_title: any;
            notes: any;
            created_at: any;
            updated_at: any;
            applicant_response: any;
            applicant_response_note: any;
            applicant_responded_at: any;
        };
        interview_schedules: Record<string, any>;
        survey_score: number | null;
        sfia_grade: number | null;
        sfia_match_percentage: number | null;
        sfia_assessment_status: "not_assessed" | "not_configured" | "assessed";
        skill_breakdown: any;
        resume_upload: ApplicationResumeUploadDto | null;
        application_id: any;
        applicant_id: any;
        status: any;
        applied_at: any;
        job_posting_id: any;
        applicant_profile: {
            first_name: any;
            last_name: any;
            email: any;
            phone_number: any;
            applicant_code: any;
        }[];
        job_postings: {
            title: any;
            description: any;
            location: any;
            employment_type: any;
            salary_range: any;
            status: any;
            posted_at: any;
            closes_at: any;
        }[];
    }>;
    private getSfiaScoreForApplication;
    getMyApplications(applicantId: string): Promise<{
        application_id: any;
        status: any;
        applied_at: any;
        job_posting_id: any;
        offer_deadline: any;
        job_postings: {
            title: any;
            location: any;
            employment_type: any;
            status: any;
        }[];
    }[]>;
    private buildRankedCandidates;
    private sortCandidatesByMode;
    private computeSfiaScore;
    private getJobDemandSkills;
    private getCandidateSupplySkills;
    private getCandidateSupplySkillsForApplication;
    private calculateAndCacheSfiaScoreForApplication;
    private cacheSfiaScore;
    private ensureSfiaApplicationRow;
    private getLatestResumeUpload;
    private readFirstValue;
    private readFirstString;
    private readNullableNumber;
    private getRankedApplicationRows;
    private getApplicantProfiles;
    private attachSkillNames;
    private getSkillPrimaryKeyColumn;
    private handleMissingSfiaSchema;
    acceptOffer(applicationId: string, applicantId: string): Promise<{
        status: string;
    }>;
    private getManilaDayCode;
    private parseScheduleWorkdays;
    autoMarkAbsent(): Promise<void>;
    autoCloseOpenClockIns(): Promise<void>;
    expireStaleOffers(): Promise<void>;
    private detectResumeDocumentType;
    private extractResumeText;
    private matchSkillsFromText;
    private getAllSfiaSkills;
    private populateCandidateSkillScores;
    private downloadResumeBuffer;
}
export {};
