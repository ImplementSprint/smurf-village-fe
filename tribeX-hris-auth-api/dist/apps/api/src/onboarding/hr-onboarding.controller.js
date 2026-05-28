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
exports.HrOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const onboarding_service_1 = require("./onboarding.service");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const add_remark_dto_1 = require("./dto/add-remark.dto");
const update_deadline_dto_1 = require("./dto/update-deadline.dto");
const reject_session_dto_1 = require("./dto/reject-session.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const HR_ONLY = [
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'HR Onboarding Officer',
    'Admin',
    'System Admin',
];
let HrOnboardingController = class HrOnboardingController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    getAllSessions(includeDeclined) {
        return this.onboardingService.getAllOnboardingSessions(includeDeclined === 'true');
    }
    getSession(sessionId) {
        return this.onboardingService.getSessionById(sessionId);
    }
    updateItemStatus(onboardingItemId, dto, req) {
        return this.onboardingService.updateItemStatus(onboardingItemId, dto, req.user.sub_userid);
    }
    addRemark(dto, req) {
        return this.onboardingService.addRemark(dto, req.user.sub_userid);
    }
    updateDeadline(sessionId, dto) {
        return this.onboardingService.updateSessionDeadline(sessionId, dto.deadline_date);
    }
    approveSession(sessionId, req) {
        return this.onboardingService.approveSession(sessionId, req.user.sub_userid);
    }
    rejectSession(sessionId, dto, req) {
        return this.onboardingService.rejectSession(sessionId, dto.reason, req.user.sub_userid);
    }
};
exports.HrOnboardingController = HrOnboardingController;
__decorate([
    (0, common_1.Get)('sessions'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'List all onboarding sessions with employee names' }),
    (0, swagger_1.ApiQuery)({ name: 'include_declined', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('include_declined')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "getAllSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get full detail of a single onboarding session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "getSession", null);
__decorate([
    (0, common_1.Patch)('items/:onboardingItemId'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Approve, reject, or update status of an onboarding item' }),
    __param(0, (0, common_1.Param)('onboardingItemId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_task_status_dto_1.UpdateTaskStatusDto, Object]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "updateItemStatus", null);
__decorate([
    (0, common_1.Post)('remarks'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Add a remark to an onboarding session' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_remark_dto_1.AddRemarkDto, Object]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "addRemark", null);
__decorate([
    (0, common_1.Patch)('sessions/:sessionId/deadline'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Update the deadline of an onboarding session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_deadline_dto_1.UpdateDeadlineDto]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "updateDeadline", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/approve'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Final approval of completed onboarding' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "approveSession", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/reject'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Reject full onboarding and send it back to applicant with required reason' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_session_dto_1.RejectSessionDto, Object]),
    __metadata("design:returntype", void 0)
], HrOnboardingController.prototype, "rejectSession", null);
exports.HrOnboardingController = HrOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('HR Onboarding Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('onboarding/hr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], HrOnboardingController);
//# sourceMappingURL=hr-onboarding.controller.js.map