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
exports.LeaveBalancesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leave_balances_service_1 = require("./leave-balances.service");
const upsert_employee_leave_balances_dto_1 = require("./dto/upsert-employee-leave-balances.dto");
const company_default_leave_balances_dto_1 = require("./dto/company-default-leave-balances.dto");
const bulk_leave_balance_dto_1 = require("./dto/bulk-leave-balance.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const LEAVE_BALANCE_MANAGERS = ['System Admin', 'HR Officer', 'HR Recruiter', 'HR Interviewer', 'Manager'];
const HR_AND_ABOVE = ['Admin', 'System Admin', 'HR Officer', 'HR Recruiter', 'HR Interviewer', 'Manager'];
let LeaveBalancesController = class LeaveBalancesController {
    leaveBalancesService;
    constructor(leaveBalancesService) {
        this.leaveBalancesService = leaveBalancesService;
    }
    getMyBalances(req) {
        return this.leaveBalancesService.getMyBalances(req.user.sub_userid);
    }
    getCompanyDefaults(req) {
        return this.leaveBalancesService.getCompanyDefaults(req.user.company_id);
    }
    upsertCompanyDefaults(req, dto) {
        return this.leaveBalancesService.upsertCompanyDefaults(req.user.company_id, dto, req.user.sub_userid);
    }
    getDepartmentDefaults(departmentId, req) {
        return this.leaveBalancesService.getDepartmentDefaults(req.user.company_id, departmentId);
    }
    upsertDepartmentDefaults(departmentId, req, dto) {
        return this.leaveBalancesService.upsertDepartmentDefaults(req.user.company_id, departmentId, dto, req.user.sub_userid);
    }
    backfillCompanyDefaults(req) {
        return this.leaveBalancesService.backfillCompanyDefaults(req.user.company_id, req.user.sub_userid);
    }
    reconcileCompanyBalances(req) {
        return this.leaveBalancesService.reconcileCompanyBalances(req.user.company_id, req.user.sub_userid);
    }
    getRoster(req) {
        return this.leaveBalancesService.getRoster(req.user.company_id);
    }
    getEmployeeBalances(userId, req) {
        return this.leaveBalancesService.getEmployeeBalances(userId, req.user.company_id);
    }
    upsertEmployeeBalances(userId, req, dto) {
        return this.leaveBalancesService.upsertEmployeeBalances(userId, req.user.company_id, dto, req.user.sub_userid);
    }
    resetToDepartment(userId, req) {
        return this.leaveBalancesService.resetToDepartment(userId, req.user.company_id, req.user.sub_userid);
    }
    resetToCompanyDefault(userId, req) {
        return this.leaveBalancesService.resetToCompanyDefault(userId, req.user.company_id, req.user.sub_userid);
    }
    bulkAssign(req, dto) {
        return this.leaveBalancesService.bulkAssign(req.user.company_id, dto, req.user.sub_userid);
    }
};
exports.LeaveBalancesController = LeaveBalancesController;
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get my own leave balances' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "getMyBalances", null);
__decorate([
    (0, common_1.Get)('company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get company-wide leave defaults' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "getCompanyDefaults", null);
__decorate([
    (0, common_1.Put)('company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Set company-wide leave defaults' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, company_default_leave_balances_dto_1.CompanyDefaultLeaveBalancesDto]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "upsertCompanyDefaults", null);
__decorate([
    (0, common_1.Get)('departments/:departmentId/default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiParam)({ name: 'departmentId' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get department leave defaults' }),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "getDepartmentDefaults", null);
__decorate([
    (0, common_1.Put)('departments/:departmentId/default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiParam)({ name: 'departmentId' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Set department leave defaults' }),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, company_default_leave_balances_dto_1.CompanyDefaultLeaveBalancesDto]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "upsertDepartmentDefaults", null);
__decorate([
    (0, common_1.Post)('company-default/backfill'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Apply defaults to employees with no balance rows' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "backfillCompanyDefaults", null);
__decorate([
    (0, common_1.Post)('reconcile'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Reconcile all employee leave balances across policy + usage tables' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "reconcileCompanyBalances", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get leave balance roster for all employees' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "getRoster", null);
__decorate([
    (0, common_1.Get)('employees/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the employee' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Get leave balances for a specific employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "getEmployeeBalances", null);
__decorate([
    (0, common_1.Put)('employees/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the employee' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Set individual leave balances for an employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, upsert_employee_leave_balances_dto_1.UpsertEmployeeLeaveBalancesDto]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "upsertEmployeeBalances", null);
__decorate([
    (0, common_1.Post)('employees/:userId/reset-department'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiParam)({ name: 'userId' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Reset employee balances to department baseline' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "resetToDepartment", null);
__decorate([
    (0, common_1.Post)('employees/:userId/reset-company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiParam)({ name: 'userId' }),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Reset employee balances to company defaults' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "resetToCompanyDefault", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...LEAVE_BALANCE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Bulk assign leave balances (company / department / employees)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_leave_balance_dto_1.BulkLeaveBalanceDto]),
    __metadata("design:returntype", void 0)
], LeaveBalancesController.prototype, "bulkAssign", null);
exports.LeaveBalancesController = LeaveBalancesController = __decorate([
    (0, swagger_1.ApiTags)('Leave Balances'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leave-balances'),
    __metadata("design:paramtypes", [leave_balances_service_1.LeaveBalancesService])
], LeaveBalancesController);
//# sourceMappingURL=leave-balances.controller.js.map