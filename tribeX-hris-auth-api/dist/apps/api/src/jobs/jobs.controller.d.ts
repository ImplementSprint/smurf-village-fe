import { JobsService } from './jobs.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { SetQuestionsDto } from './dto/create-questions.dto';
import { GetRankedCandidatesDto } from './dto/get-ranked-candidates.dto';
import { SaveManualRankingDto } from './dto/save-manual-ranking.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { InterviewResponseDto } from './dto/interview-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
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
    getOpenJobsForApplicant(req: any): Promise<any[]>;
    getMyApplications(req: any): Promise<{
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
    getMyApplicationDetail(applicationId: string, req: any): Promise<{
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
        resume_upload: import("./dto/application-resume-upload.dto").ApplicationResumeUploadDto | null;
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
    getMyInterviewSchedules(req: any): Promise<{
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
    acceptOffer(applicationId: string, req: any): Promise<{
        status: string;
    }>;
    acceptOfferAlias(id: string, req: any): Promise<{
        status: string;
    }>;
    respondToInterview(applicationId: string, dto: InterviewResponseDto, req: any): Promise<{
        message: string;
    }>;
    getJobSfiaRequirementsForApplicant(jobPostingId: string): Promise<{
        skill_id: string;
        skill_name: string;
        required_level: number;
    }[]>;
    getApplicationDetail(applicationId: string, req: any): Promise<{
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
        resume_upload: import("./dto/application-resume-upload.dto").ApplicationResumeUploadDto | null;
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
    getSurveyScore(applicationId: string): Promise<{
        applicationId: any;
        applicantId: any;
        surveyScore: number;
    }>;
    updateApplicationStatus(applicationId: string, body: UpdateApplicationStatusDto, req: any): Promise<{
        message: string;
    }>;
    scheduleInterview(applicationId: string, dto: ScheduleInterviewDto, req: any): Promise<{
        message: string;
        schedule_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    resendInterviewEmail(applicationId: string, req: any): Promise<{
        message: string;
    }>;
    cancelInterviewSchedule(applicationId: string, stage: string, reason: string | undefined, req: any): Promise<{
        message: string;
    }>;
    getHRInterviewNotifications(req: any): Promise<{
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
    createPosting(dto: CreateJobPostingDto, req: any): Promise<any>;
    findAllPostings(req: any): Promise<any[]>;
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
    suggestSfiaSkills(id: string, req: any): Promise<{
        skill_id: string;
        skill_name: string;
        suggested_level: number;
    }[]>;
    findOnePosting(id: string, req: any): Promise<any>;
    updatePosting(id: string, dto: UpdateJobPostingDto, req: any): Promise<any>;
    closePosting(id: string, req: any): Promise<{
        message: string;
    }>;
    setQuestions(id: string, dto: SetQuestionsDto, req: any): Promise<any[]>;
    getQuestions(id: string): Promise<{
        question_id: any;
        question_text: any;
        question_type: any;
        options: any;
        is_required: any;
        sort_order: any;
    }[]>;
    getJobSfiaSkills(id: string, req: any): Promise<{
        job_posting_skills_id: any;
        skill_id: any;
        required_level: any;
        weight: any;
    }[]>;
    saveJobSfiaSkills(id: string, body: {
        skills: Array<{
            skill_id: string;
            required_level: number;
            weight?: number;
        }>;
    }, req: any): Promise<{
        job_posting_skills_id: any;
        skill_id: any;
        required_level: any;
        weight: any;
    }[]>;
    getRankedCandidates(id: string, query: GetRankedCandidatesDto, req: any): Promise<{
        job_posting_id: string;
        title: any;
        ranking_mode: "sfia" | "manual";
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
            skill_breakdown: {
                sfia_skill_id: string;
                skill_name: string;
                demand_level: number;
                supply_level: number;
                points: number;
                matched: boolean;
            }[];
        }[];
    }>;
    saveManualRanking(id: string, dto: SaveManualRankingDto, req: any): Promise<{
        message: string;
        job_posting_id: string;
        updated_count: number;
    }>;
    getApplicationsForJob(jobPostingId: string, req: any, includePast?: string): Promise<({
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
        applicant_profile: {
            applicant_id: string;
            first_name: string | null;
            last_name: string | null;
            email: string | null;
            phone_number: string | null;
            applicant_code: string | null;
        } | null;
    })[]>;
    applyToJob(id: string, dto: CreateApplicationDto, req: any): Promise<any>;
}
