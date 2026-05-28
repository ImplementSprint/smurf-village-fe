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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const leave_service_1 = require("./leave.service");
const file_leave_request_dto_1 = require("./dto/file-leave-request.dto");
const review_leave_request_dto_1 = require("./dto/review-leave-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'Manager',
];
let LeaveController = class LeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    getMyBalances(req) {
        return this.leaveService.getMyLeaveBalances(req.user.sub_userid, req.user.company_id);
    }
    fileLeaveRequest(req, dto) {
        return this.leaveService.fileLeaveRequest(req.user.sub_userid, req.user.company_id, dto);
    }
    getMyLeaveRequests(req) {
        return this.leaveService.getMyLeaveRequests(req.user.sub_userid);
    }
    cancelPendingLeave(requestId, req) {
        return this.leaveService.cancelPendingLeave(requestId, req.user.sub_userid);
    }
    requestLeaveRevocation(requestId, req, body) {
        return this.leaveService.requestLeaveRevocation(requestId, req.user.sub_userid, body.reason);
    }
    uploadAttachment(req, file) {
        return this.leaveService.uploadLeaveAttachment(req.user.sub_userid, file);
    }
    getLeaveRequests(req, status) {
        return this.leaveService.getLeaveRequests(req.user.company_id, status);
    }
    reviewLeaveRequest(requestId, req, dto) {
        return this.leaveService.reviewLeaveRequest(requestId, req.user.sub_userid, req.user.company_id, dto);
    }
    reviewLeaveRevocation(requestId, req, body) {
        return this.leaveService.reviewLeaveRevocation(requestId, req.user.sub_userid, req.user.company_id, body.action);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Get)('balances'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get own leave balances' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my leave balances for the current year',
        description: 'Returns leave balances (Vacation, Sick, Emergency, Personal) for the employee',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getMyBalances", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: File a leave request' }),
    (0, swagger_1.ApiOperation)({
        summary: 'File a new leave request',
        description: 'Employees submit leave requests for manager/HR approval',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, file_leave_request_dto_1.FileLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "fileLeaveRequest", null);
__decorate([
    (0, common_1.Get)('requests/me'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get own leave request history' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getMyLeaveRequests", null);
__decorate([
    (0, common_1.Patch)('requests/:requestId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Cancel a pending leave request' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "cancelPendingLeave", null);
__decorate([
    (0, common_1.Patch)('requests/:requestId/request-revocation'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Request revocation of an approved leave (future dates only)' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "requestLeaveRevocation", null);
__decorate([
    (0, common_1.Post)('upload-attachment'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Upload leave proof attachment (image or PDF)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "uploadAttachment", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get all leave requests for company' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, example: 'Pending' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Patch)('requests/:requestId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approve or reject a leave request' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_leave_request_dto_1.ReviewLeaveRequestDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "reviewLeaveRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:requestId/review-revocation'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approve or reject an employee revocation request' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "reviewLeaveRevocation", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)('Leave'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map