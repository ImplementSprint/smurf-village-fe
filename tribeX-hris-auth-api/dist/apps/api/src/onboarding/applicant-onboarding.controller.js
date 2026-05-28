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
exports.ApplicantOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const onboarding_service_1 = require("./onboarding.service");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const save_profile_dto_1 = require("./dto/save-profile.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const ONBOARDING_USERS = ['Employee', 'Manager', 'HR Officer', 'Admin', 'System Admin'];
let ApplicantOnboardingController = class ApplicantOnboardingController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    getMySession(req) {
        return this.onboardingService.getMySession(req.user.sub_userid);
    }
    uploadDocument(dto, file, isProofOfReceipt) {
        return this.onboardingService.uploadDocument(dto.onboardingItemId, file, isProofOfReceipt === 'true');
    }
    confirmTask(onboardingItemId) {
        return this.onboardingService.confirmTask(onboardingItemId);
    }
    saveProfile(sessionId, dto) {
        return this.onboardingService.saveProfile(sessionId, dto);
    }
    submitForReview(sessionId) {
        return this.onboardingService.submitForReview(sessionId);
    }
    requestEquipment(onboardingItemId, body) {
        return this.onboardingService.requestEquipment(onboardingItemId, body);
    }
    acceptOffer(sessionId, req) {
        return this.onboardingService.acceptOffer(sessionId, req.user.sub_userid);
    }
    declineOffer(sessionId, req) {
        return this.onboardingService.declineOffer(sessionId, req.user.sub_userid);
    }
};
exports.ApplicantOnboardingController = ApplicantOnboardingController;
__decorate([
    (0, common_1.Get)('session'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Get my full onboarding session with all items grouped by category' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "getMySession", null);
__decorate([
    (0, common_1.Post)('upload-document'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a document or equipment receipt photo' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiQuery)({ name: 'isProofOfReceipt', required: false, type: Boolean }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('isProofOfReceipt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upload_document_dto_1.UploadDocumentDto, Object, String]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('items/:onboardingItemId/confirm'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a text-based task (handbook, video, code of conduct)' }),
    __param(0, (0, common_1.Param)('onboardingItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "confirmTask", null);
__decorate([
    (0, common_1.Put)('session/:sessionId/profile'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Save or update personal and emergency contact info' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, save_profile_dto_1.SaveProfileDto]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "saveProfile", null);
__decorate([
    (0, common_1.Post)('session/:sessionId/submit'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Submit onboarding for HR review' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Patch)('items/:onboardingItemId/request-equipment'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Submit equipment request with delivery preference' }),
    __param(0, (0, common_1.Param)('onboardingItemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "requestEquipment", null);
__decorate([
    (0, common_1.Post)('session/:sessionId/accept'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a job offer — unlocks onboarding tasks' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Post)('session/:sessionId/decline'),
    (0, roles_decorator_1.Roles)(...ONBOARDING_USERS),
    (0, swagger_1.ApiOperation)({ summary: 'Decline a job offer — archives the session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicantOnboardingController.prototype, "declineOffer", null);
exports.ApplicantOnboardingController = ApplicantOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Applicant Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('onboarding/applicant'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], ApplicantOnboardingController);
//# sourceMappingURL=applicant-onboarding.controller.js.map