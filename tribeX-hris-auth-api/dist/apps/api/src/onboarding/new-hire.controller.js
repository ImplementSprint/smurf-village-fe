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
exports.NewHireController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const onboarding_service_1 = require("./onboarding.service");
const applicant_jwt_auth_guard_1 = require("../auth/applicant-jwt-auth.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'HR Onboarding Officer',
    'Manager',
];
let NewHireController = class NewHireController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    getMyOnboarding(req) {
        return this.onboardingService.getMyOnboarding(req.user.sub_userid);
    }
    saveOnboarding(req, body) {
        return this.onboardingService.saveOnboarding(req.user.sub_userid, body);
    }
    submitOnboarding(req) {
        return this.onboardingService.submitOnboarding(req.user.sub_userid);
    }
    getSubmissions(req, status) {
        return this.onboardingService.getHROnboardingSubmissions(req.user.company_id, status);
    }
    getSubmission(id, req) {
        return this.onboardingService.getHROnboardingSubmission(id, req.user.company_id);
    }
    approveSubmission(id, roleId, req) {
        return this.onboardingService.approveOnboardingSubmission(id, roleId, req.user.company_id, req.user.sub_userid);
    }
    rejectSubmission(id, hrNotes, req) {
        return this.onboardingService.rejectOnboardingSubmission(id, hrNotes, req.user.company_id, req.user.sub_userid);
    }
};
exports.NewHireController = NewHireController;
__decorate([
    (0, common_1.Get)('my-onboarding'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: get own onboarding submission' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "getMyOnboarding", null);
__decorate([
    (0, common_1.Put)('my-onboarding'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: save onboarding submission draft' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "saveOnboarding", null);
__decorate([
    (0, common_1.Post)('my-onboarding/submit'),
    (0, common_1.UseGuards)(applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant: submit onboarding for HR review' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "submitOnboarding", null);
__decorate([
    (0, common_1.Get)('submissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: list all new hire submissions' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "getSubmissions", null);
__decorate([
    (0, common_1.Get)('submissions/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: get single submission' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Post)('submissions/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: approve submission and create employee account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role_id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "approveSubmission", null);
__decorate([
    (0, common_1.Post)('submissions/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: reject submission with feedback' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('hr_notes')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], NewHireController.prototype, "rejectSubmission", null);
exports.NewHireController = NewHireController = __decorate([
    (0, swagger_1.ApiTags)('New Hire Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('onboarding'),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], NewHireController);
//# sourceMappingURL=new-hire.controller.js.map