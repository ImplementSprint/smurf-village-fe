"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const applicant_jwt_auth_guard_1 = require("../auth/applicant-jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const jobs_service_1 = require("./jobs.service");
const create_job_posting_dto_1 = require("./dto/create-job-posting.dto");
const update_job_posting_dto_1 = require("./dto/update-job-posting.dto");
const create_application_dto_1 = require("./dto/create-application.dto");
const create_questions_dto_1 = require("./dto/create-questions.dto");
const get_ranked_candidates_dto_1 = require("./dto/get-ranked-candidates.dto");
const save_manual_ranking_dto_1 = require("./dto/save-manual-ranking.dto");
const schedule_interview_dto_1 = require("./dto/schedule-interview.dto");
const interview_response_dto_1 = require("./dto/interview-response.dto");
const update_application_status_dto_1 = require("./dto/update-application-status.dto");
const HR_AND_ABOVE = ['Admin', 'System Admin', 'HR Officer', 'HR Recruiter', 'HR Interviewer', 'Manager'];
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    getPublicCareersBySlug(slug) {
        return this.jobsService.getPublicCareersBySlug(slug);
    }
    getOpenJobsForApplicant(req) {
        return this.jobsService.getOpenJobsForApplicant(req.user.company_id ?? null);
    }
    getMyApplications(req) {
        return this.jobsService.getMyApplications(req.user.sub_userid);
    }
    getMyApplicationDetail(applicationId, req) {
        return this.jobsService.getMyApplicationDetail(applicationId, req.user.sub_userid);
    }
    getMyInterviewSchedules(req) {
        return this.jobsService.getMyInterviewSchedules(req.user.sub_userid);
    }
    acceptOffer(applicationId, req) {
        return this.jobsService.acceptOffer(applicationId, req.user.applicant_id ?? req.user.sub_userid);
    }
    acceptOfferAlias(id, req) {
        return this.jobsService.acceptOffer(id, req.user.applicant_id ?? req.user.sub_userid);
    }
    respondToInterview(applicationId, dto, req) {
        return this.jobsService.respondToInterview(applicationId, req.user.sub_userid, dto);
    }
    getJobSfiaRequirementsForApplicant(jobPostingId) {
        return this.jobsService.getJobSfiaRequirementsForApplicant(jobPostingId);
    }
    getApplicationDetail(applicationId, req) {
        return this.jobsService.getApplicationDetail(applicationId, req.user.company_id);
    }
    getSurveyScore(applicationId) {
        return this.jobsService.getSurveyScore(applicationId);
    }
    updateApplicationStatus(applicationId, body, req) {
        return this.jobsService.updateApplicationStatus(applicationId, body.status, req.user.company_id, body.rejection_reason, body);
    }
    scheduleInterview(applicationId, dto, req) {
        return this.jobsService.scheduleInterview(applicationId, dto, req.user.company_id);
    }
    resendInterviewEmail(applicationId, req) {
        return this.jobsService.resendInterviewEmail(applicationId, req.user.company_id);
    }
    cancelInterviewSchedule(applicationId, stage, reason, req) {
        return this.jobsService.cancelInterviewSchedule(applicationId, stage, req.user.company_id, reason);
    }
    getHRInterviewNotifications(req) {
        return this.jobsService.getHRInterviewNotifications(req.user.company_id);
    }
    createPosting(dto, req) {
        return this.jobsService.createPosting(dto, req.user.company_id, req.user.sub_userid);
    }
    findAllPostings(req) {
        return this.jobsService.findAllPostings(req.user.company_id);
    }
    listSfiaSkills() {
        return this.jobsService.listSfiaSkills();
    }
    suggestSfiaSkills(id, req) {
        return this.jobsService.suggestSfiaSkillsFromJobDescription(id, req.user.company_id);
    }
    findOnePosting(id, req) {
        return this.jobsService.findOnePosting(id, req.user.company_id);
    }
    updatePosting(id, dto, req) {
        return this.jobsService.updatePosting(id, dto, req.user.company_id, req.user.sub_userid);
    }
    closePosting(id, req) {
        return this.jobsService.closePosting(id, req.user.company_id, req.user.sub_userid);
    }
    setQuestions(id, dto, req) {
        return this.jobsService.setQuestionsForPosting(id, dto.questions, req.user.company_id, req.user.sub_userid);
    }
    getQuestions(id) {
        return this.jobsService.getQuestionsForPosting(id);
    }
    getJobSfiaSkills(id, req) {
        return this.jobsService.getJobSfiaSkills(id, req.user.company_id);
    }
    saveJobSfiaSkills(id, body, req) {
        return this.jobsService.saveJobSfiaSkills(id, body.skills ?? [], req.user.company_id);
    }
    getRankedCandidates(id, query, req) {
        return this.jobsService.getRankedCandidates(id, req.user.company_id, query);
    }
    saveManualRanking(id, dto, req) {
        return this.jobsService.saveManualRanking(id, req.user.company_id, req.user.sub_userid, dto.rankings);
    }
    getApplicationsForJob(jobPostingId, req, includePast) {
        return this.jobsService.getApplicationsForJob(jobPostingId, req.user.company_id, includePast === 'true');
    }
    applyToJob(id, dto, req) {
        return this.jobsService.applyToJob(id, req.user.sub_userid, req.user.company_id ?? null, dto);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Get)('public/careers/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Public: Get company info + open jobs by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getPublicCareersBySlug", null);
__decorate([
    (0, common_1.Get)('applicant/open'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Browse open job listings for their company' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getOpenJobsForApplicant", null);
__decorate([
    (0, common_1.Get)('applicant/my-applications'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: View own submitted applications' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('applicant/my-applications/:applicationId'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Get own application detail with answers' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getMyApplicationDetail", null);
__decorate([
    (0, common_1.Get)('applicant/my-interview-schedules'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Get all interview schedules across all applications' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getMyInterviewSchedules", null);
__decorate([
    (0, common_1.Patch)('applicant/my-applications/:applicationId/accept-offer'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Accept a hiring offer (status must be "hired")' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Patch)('applications/:id/accept-offer'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Accept a hiring offer (alias route)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "acceptOfferAlias", null);
__decorate([
    (0, common_1.Post)('applicant/my-applications/:applicationId/interview-response'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Accept, decline, or request reschedule for an interview' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, interview_response_dto_1.InterviewResponseDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "respondToInterview", null);
__decorate([
    (0, common_1.Get)('applicant/job-sfia-requirements/:jobPostingId'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Get required SFIA skills for a job posting (for supply/demand display)' }),
    __param(0, (0, common_1.Param)('jobPostingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getJobSfiaRequirementsForApplicant", null);
__decorate([
    (0, common_1.Get)('applications/:applicationId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get a single application with answers' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getApplicationDetail", null);
__decorate([
    (0, common_1.Get)('applications/:applicationId/survey-score'),
    (0, swagger_1.ApiOperation)({ summary: 'Public: Get survey score for an application (bypasses auth for testing)' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getSurveyScore", null);
__decorate([
    (0, common_1.Patch)('applications/:applicationId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Update an application status' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_status_dto_1.UpdateApplicationStatusDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Post)('applications/:applicationId/interview-schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Schedule an interview and notify applicant by email' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, schedule_interview_dto_1.ScheduleInterviewDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "scheduleInterview", null);
__decorate([
    (0, common_1.Post)('applications/:applicationId/interview-schedule/resend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Resend the interview schedule email to the applicant' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "resendInterviewEmail", null);
__decorate([
    (0, common_1.Delete)('applications/:applicationId/interview-schedule/:stage'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Cancel an interview schedule for a specific stage and notify the applicant' }),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Param)('stage')),
    __param(2, (0, common_1.Query)('reason')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "cancelInterviewSchedule", null);
__decorate([
    (0, common_1.Get)('hr/interview-notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get applicant interview responses (accepted / declined / reschedule_requested)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getHRInterviewNotifications", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Create a new job posting' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_job_posting_dto_1.CreateJobPostingDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "createPosting", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: List all job postings for this company' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findAllPostings", null);
__decorate([
    (0, common_1.Get)('sfia-skills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: List master SFIA skills catalogue' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "listSfiaSkills", null);
__decorate([
    (0, common_1.Get)(':id/sfia-skills/suggest'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Suggest SFIA skills based on job description text' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "suggestSfiaSkills", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get a single job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findOnePosting", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Update a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_job_posting_dto_1.UpdateJobPostingDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "updatePosting", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Close a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "closePosting", null);
__decorate([
    (0, common_1.Put)(':id/questions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Set application form questions for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_questions_dto_1.SetQuestionsDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "setQuestions", null);
__decorate([
    (0, common_1.Get)(':id/questions'),
    (0, swagger_1.ApiOperation)({ summary: 'Public: Get application questions for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Get)(':id/sfia-skills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get required SFIA skills for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getJobSfiaSkills", null);
__decorate([
    (0, common_1.Put)(':id/sfia-skills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Set required SFIA skills for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "saveJobSfiaSkills", null);
__decorate([
    (0, common_1.Get)(':id/candidates/ranked'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get ranked candidates for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_ranked_candidates_dto_1.GetRankedCandidatesDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getRankedCandidates", null);
__decorate([
    (0, common_1.Put)(':id/candidates/manual-rank'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Save manual candidate ranking for a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, save_manual_ranking_dto_1.SaveManualRankingDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "saveManualRanking", null);
__decorate([
    (0, common_1.Get)(':jobPostingId/applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HR Officer', 'HR Recruiter', 'HR Interviewer', 'HR Onboarding Officer', 'Admin', 'System Admin', 'Manager'),
    (0, swagger_1.ApiOperation)({ summary: 'HR: View all applicants for a job posting' }),
    (0, swagger_1.ApiQuery)({ name: 'include_past', required: false, type: Boolean }),
    __param(0, (0, common_1.Param)('jobPostingId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('include_past')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "getApplicationsForJob", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Apply to a job posting' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_application_dto_1.CreateApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "applyToJob", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)('Jobs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map