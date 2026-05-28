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
exports.ApplicantsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const applicant_jwt_auth_guard_1 = require("../auth/applicant-jwt-auth.guard");
const throttler_1 = require("@nestjs/throttler");
const applicants_service_1 = require("./applicants.service");
const create_applicant_dto_1 = require("./dto/create-applicant.dto");
const applicant_login_dto_1 = require("./dto/applicant-login.dto");
const upload_sfia_resume_dto_1 = require("./dto/upload-sfia-resume.dto");
const APPLICANT_COOKIE = 'applicant_refresh_token';
function cookieOptions(maxAgeMs) {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: maxAgeMs,
        path: '/api/tribeX/auth/v1',
    };
}
let ApplicantsController = class ApplicantsController {
    applicantsService;
    constructor(applicantsService) {
        this.applicantsService = applicantsService;
    }
    register(dto, companyId) {
        return this.applicantsService.register(dto, companyId);
    }
    async login(dto, res) {
        const { access_token, refresh_token, refresh_max_age_ms } = await this.applicantsService.login(dto);
        res.cookie(APPLICANT_COOKIE, refresh_token, cookieOptions(refresh_max_age_ms));
        return { access_token };
    }
    async refresh(req, res) {
        const token = req.cookies[APPLICANT_COOKIE];
        if (!token)
            throw new common_1.UnauthorizedException('No applicant refresh token cookie');
        const { access_token, refresh_token, refresh_max_age_ms } = await this.applicantsService.refresh(token);
        res.cookie(APPLICANT_COOKIE, refresh_token, cookieOptions(refresh_max_age_ms));
        return { access_token };
    }
    async logout(req, res, authHeader) {
        const refreshToken = req.cookies[APPLICANT_COOKIE];
        if (!refreshToken)
            throw new common_1.UnauthorizedException('No applicant refresh token cookie');
        const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        await this.applicantsService.logout(refreshToken, accessToken);
        const isProd = process.env.NODE_ENV === 'production';
        res.clearCookie(APPLICANT_COOKIE, {
            path: '/api/v1',
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        });
        return { message: 'Logged out' };
    }
    verifyEmail(token) {
        return this.applicantsService.verifyEmail(token);
    }
    resendVerification(body) {
        return this.applicantsService.resendVerification(body.email);
    }
    getMe(req) {
        return this.applicantsService.getMe(req.user.sub_userid);
    }
    updateMe(req, body) {
        return this.applicantsService.updateMe(req.user.sub_userid, body);
    }
    uploadResume(req, file) {
        return this.applicantsService.uploadResume(req.user.sub_userid, file);
    }
    deleteResume(req) {
        return this.applicantsService.deleteResume(req.user.sub_userid);
    }
    uploadSfiaResume(dto, applicantIdParam, req) {
        const applicantId = applicantIdParam || req.user.sub_userid;
        return this.applicantsService.uploadSfiaResume(applicantId, dto);
    }
};
exports.ApplicantsController = ApplicantsController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant self-registration via Career Portal' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('company')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_applicant_dto_1.CreateApplicantDto, String]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant login — returns access token + sets HttpOnly refresh cookie' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [applicant_login_dto_1.ApplicantLoginDto, Object]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Issue new access token from applicant refresh cookie' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke applicant session and blacklist access token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ApplicantsController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify applicant email address via token' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resend verification email to an unverified applicant' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get own applicant profile' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update own applicant profile' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/resume'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Upload or replace applicant resume (PDF/DOC/DOCX, max 5MB)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "uploadResume", null);
__decorate([
    (0, common_1.Delete)('me/resume'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete applicant resume' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "deleteResume", null);
__decorate([
    (0, common_1.Post)('sfia-upload'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: Upload SFIA resume for a specific job posting (applicant_id optional for testing)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('applicant_id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_sfia_resume_dto_1.UploadSfiaResumeDto, String, Object]),
    __metadata("design:returntype", void 0)
], ApplicantsController.prototype, "uploadSfiaResume", null);
exports.ApplicantsController = ApplicantsController = __decorate([
    (0, swagger_1.ApiTags)('Applicants'),
    (0, common_1.Controller)('applicants'),
    __metadata("design:paramtypes", [applicants_service_1.ApplicantsService])
], ApplicantsController);
//# sourceMappingURL=applicants.controller.js.map