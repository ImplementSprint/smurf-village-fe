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
exports.OvertimeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const file_overtime_request_dto_1 = require("./dto/file-overtime-request.dto");
const review_overtime_request_dto_1 = require("./dto/review-overtime-request.dto");
const overtime_service_1 = require("./overtime.service");
const SCHEDULE_MANAGERS = [
    'System Admin',
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'Manager',
    'manager',
];
let OvertimeController = class OvertimeController {
    overtimeService;
    constructor(overtimeService) {
        this.overtimeService = overtimeService;
    }
    createOvertimeRequest(req, dto) {
        return this.overtimeService.createOvertimeRequest(req.user.sub_userid, dto, req);
    }
    getMyOvertimeRequests(req) {
        return this.overtimeService.getMyOvertimeRequests(req.user.sub_userid);
    }
    getMyOvertimeSummary(req, month) {
        return this.overtimeService.getMyOvertimeSummary(req.user.sub_userid, month);
    }
    getOvertimeRequests(req, status, type) {
        return this.overtimeService.getOvertimeRequests(req.user.company_id, status, type);
    }
    reviewOvertimeRequest(otId, req, dto) {
        return this.overtimeService.reviewOvertimeRequest(otId, dto, req.user.company_id, req.user.sub_userid);
    }
};
exports.OvertimeController = OvertimeController;
__decorate([
    (0, common_1.Post)('requests'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({ summary: 'Employee files an overtime request' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, file_overtime_request_dto_1.FileOvertimeRequestDto]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "createOvertimeRequest", null);
__decorate([
    (0, common_1.Get)('requests/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee gets own overtime request history' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "getMyOvertimeRequests", null);
__decorate([
    (0, common_1.Get)('my-summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee gets approved overtime summary' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: false, example: '2026-05' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "getMyOvertimeSummary", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR gets overtime requests for approval' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, example: 'PENDING' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, example: 'NORMAL' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "getOvertimeRequests", null);
__decorate([
    (0, common_1.Patch)('requests/:otId/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR reviews an overtime request' }),
    __param(0, (0, common_1.Param)('otId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_overtime_request_dto_1.ReviewOvertimeRequestDto]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "reviewOvertimeRequest", null);
exports.OvertimeController = OvertimeController = __decorate([
    (0, swagger_1.ApiTags)('Overtime'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('overtime'),
    __metadata("design:paramtypes", [overtime_service_1.OvertimeService])
], OvertimeController);
//# sourceMappingURL=overtime.controller.js.map