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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const performance_service_1 = require("./performance.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const performance_dto_1 = require("./dto/performance.dto");
const EMPLOYEE = ['Active Employee', 'Employee'];
const MANAGER = ['Manager', 'Group Head'];
const HR = ['HR Officer', 'HR Recruiter', 'HR Interviewer', 'HR Performance Management Officer'];
const HR_ONLY = ['HR Officer', 'HR Performance Management Officer'];
const SA = ['System Admin'];
const ALL_STAFF = [...EMPLOYEE, ...MANAGER, ...HR, 'Admin', 'System Admin'];
let PerformanceController = class PerformanceController {
    performanceService;
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    health() { return { status: 'ok' }; }
    getFullSettings(req) { return this.performanceService.getFullSettings(req.user.company_id); }
    saveFullSettings(req, dto) { return this.performanceService.saveFullSettings(req.user.company_id, req.user.sub_userid, dto); }
    saveFullSettingsPut(req, dto) { return this.performanceService.saveFullSettings(req.user.company_id, req.user.sub_userid, dto); }
    saveFullSettingsPost(req, dto) { return this.performanceService.saveFullSettings(req.user.company_id, req.user.sub_userid, dto); }
    createViolationRule(req, dto) { return this.performanceService.createViolationRule(req.user.company_id, dto); }
    deleteViolationRule(ruleId, req) { return this.performanceService.deleteViolationRule(ruleId, req.user.company_id); }
    computeBonusRules(req, userId, rating) { return this.performanceService.computeBonusRules(req.user.company_id, userId, parseFloat(rating)); }
    createBonusRule(req, dto) { return this.performanceService.createBonusRule(req.user.company_id, dto); }
    updateBonusRule(id, req, dto) { return this.performanceService.updateBonusRule(id, req.user.company_id, dto); }
    deleteBonusRule(id, req) { return this.performanceService.deleteBonusRule(id, req.user.company_id); }
    getActiveCycle(req) { return this.performanceService.getActiveCyclePublic(req.user.company_id); }
    getCycles(req) { return this.performanceService.getCycles(req.user.company_id); }
    createCycle(req, dto) { return this.performanceService.createCycle(req.user.company_id, req.user.sub_userid, dto); }
    patchCycle(id, req, dto) { return this.performanceService.patchCycle(id, req.user.company_id, dto); }
    deleteCycle(id, req) { return this.performanceService.deleteCycle(id, req.user.company_id); }
    getMyGoals(req) { return this.performanceService.getMyGoals(req.user.sub_userid, req.user.company_id); }
    getTeamGoals(req) { return this.performanceService.getTeamGoals(req.user.sub_userid, req.user.company_id); }
    getAllGoals(req) { return this.performanceService.getAllGoals(req.user.company_id); }
    createGoal(req, dto) { return this.performanceService.createGoal(req.user.sub_userid, req.user.role_name, req.user.company_id, dto); }
    approveGoal(id, req) { return this.performanceService.approveGoal(id, req.user.sub_userid, req.user.company_id); }
    rejectGoal(id, req, dto) { return this.performanceService.rejectGoal(id, req.user.sub_userid, req.user.company_id, dto.reason); }
    getGoalProgress(id) { return this.performanceService.getGoalProgress(id); }
    addGoalProgress(id, req, dto) { return this.performanceService.addGoalProgress(id, req.user.sub_userid, req.user.company_id, dto); }
    patchGoal(id, req, dto) { return this.performanceService.patchGoal(id, req.user.sub_userid, req.user.company_id, dto); }
    deleteGoal(id, req) { return this.performanceService.deleteGoal(id, req.user.sub_userid, req.user.company_id); }
    getMyEvaluations(req) { return this.performanceService.getMyEvaluations(req.user.sub_userid, req.user.company_id); }
    getMyEvaluationHistory(req) { return this.performanceService.getMyEvaluationHistory(req.user.sub_userid, req.user.company_id); }
    getTeamEvaluations(req) { return this.performanceService.getTeamEvaluations(req.user.sub_userid, req.user.company_id); }
    getAllEvaluations(req) { return this.performanceService.getAllEvaluations(req.user.company_id); }
    getEvaluationById(id) { return this.performanceService.getEvaluationById(id); }
    createEvaluation(req, dto) { return this.performanceService.createEvaluation(req.user.sub_userid, req.user.role_name, req.user.company_id, dto); }
    submitEvaluation(id, req) { return this.performanceService.submitEvaluation(id, req.user.sub_userid, req.user.company_id); }
    countersignEvaluation(id, req) { return this.performanceService.countersignEvaluation(id, req.user.sub_userid, req.user.company_id); }
    acknowledgeEvaluation(id, req) { return this.performanceService.acknowledgeEvaluation(id, req.user.sub_userid); }
    getEvaluationComments(evalId) { return this.performanceService.getEvaluationComments(evalId); }
    addEvaluationComment(evalId, req, dto) { return this.performanceService.addEvaluationComment(evalId, req.user.sub_userid, req.user.role_name, dto); }
    getViolationsDetailed(req) { return this.performanceService.getViolationsDetailed(req.user.company_id); }
    getViolationStats(req) { return this.performanceService.getViolationStats(req.user.company_id); }
    getViolations(req) { return this.performanceService.getViolations(req.user.company_id); }
    createViolation(req, dto) { return this.performanceService.createViolation(req.user.sub_userid, req.user.role_name, req.user.company_id, dto); }
    uploadViolationEvidence(file, req) {
        return this.performanceService.uploadViolationEvidence(file, req.user.company_id);
    }
    uploadPerformanceDocument(file, req) {
        return this.performanceService.uploadPerformanceDocument(file, req.user.company_id);
    }
    patchViolation(id, req, dto) { return this.performanceService.patchViolation(id, req.user.company_id, dto); }
    getMyPip(req) { return this.performanceService.getMyPip(req.user.sub_userid, req.user.company_id); }
    getTeamPip(req) { return this.performanceService.getTeamPip(req.user.sub_userid, req.user.company_id); }
    getAllPip(req) { return this.performanceService.getAllPip(req.user.company_id); }
    getPipById(id) { return this.performanceService.getPipById(id); }
    createPip(req, dto) { return this.performanceService.createPip(req.user.sub_userid, req.user.role_name, req.user.company_id, dto); }
    approvePip(id, req) { return this.performanceService.approvePip(id, req.user.sub_userid, req.user.company_id); }
    patchPipStatus(id, dto) { return this.performanceService.patchPipStatus(id, dto); }
    getPipUpdates(pipId) { return this.performanceService.getPipUpdates(pipId); }
    createPipUpdate(pipId, req, dto) { return this.performanceService.createPipUpdate(pipId, req.user.sub_userid, dto); }
    reviewPipUpdate(updateId, req, dto) { return this.performanceService.reviewPipUpdate(updateId, req.user.sub_userid, dto); }
    getRewards(req) { return this.performanceService.getRewards(req.user.company_id); }
    syncAllRewards(req) { return this.performanceService.syncAllRewards(req.user.company_id); }
    syncReward(id) { return this.performanceService.syncReward(id); }
    getEmployeeDashboard(req) { return this.performanceService.getEmployeeDashboard(req.user.sub_userid, req.user.company_id); }
    getManagerDashboard(req) { return this.performanceService.getManagerDashboard(req.user.sub_userid, req.user.company_id); }
    getManagerTeam(req) { return this.performanceService.getManagerTeam(req.user.sub_userid, req.user.company_id); }
    getHrDashboard(req) { return this.performanceService.getHrDashboard(req.user.company_id); }
    getHrApprovals(req, tab) { return this.performanceService.getHrApprovals(req.user.company_id, tab); }
    approveHrItem(id, req, dto) { return this.performanceService.approveHrItem(id, req.user.sub_userid, dto); }
    reviewHrItem(id, req, dto) { return this.performanceService.reviewHrItem(id, req.user.sub_userid, dto); }
    getActivityLogs(req, page, limit) { return this.performanceService.getActivityLogs(req.user.company_id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50); }
    getMySelfAssessment(req) { return this.performanceService.getMySelfAssessment(req.user.sub_userid, req.user.company_id); }
    createOrUpdateSelfAssessment(req, dto) { return this.performanceService.createOrUpdateSelfAssessment(req.user.sub_userid, req.user.company_id, dto); }
    getSelfAssessmentByUser(targetUserId, req) { return this.performanceService.getSelfAssessmentByUser(targetUserId, req.user.company_id); }
    getRatingLabels(req) { return this.performanceService.getRatingLabels(req.user.company_id); }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('settings/full'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Get all performance settings' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getFullSettings", null);
__decorate([
    (0, common_1.Patch)('settings/full'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Save all performance settings (PATCH)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CycleSettingsDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "saveFullSettings", null);
__decorate([
    (0, common_1.Put)('settings/full'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Save all performance settings (PUT)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CycleSettingsDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "saveFullSettingsPut", null);
__decorate([
    (0, common_1.Post)('settings/full'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Save all performance settings (POST)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CycleSettingsDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "saveFullSettingsPost", null);
__decorate([
    (0, common_1.Post)('violation-rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Create violation rule' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateViolationRuleDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createViolationRule", null);
__decorate([
    (0, common_1.Delete)('violation-rules/:rule_id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Delete violation rule' }),
    __param(0, (0, common_1.Param)('rule_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteViolationRule", null);
__decorate([
    (0, common_1.Get)('bonus-rules/compute'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER, ...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Manager/HR: Compute bonus for employee at rating' }),
    (0, swagger_1.ApiQuery)({ name: 'user_id', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'rating', required: true }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Query)('rating')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "computeBonusRules", null);
__decorate([
    (0, common_1.Post)('bonus-rules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Create bonus rule' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateBonusRuleDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createBonusRule", null);
__decorate([
    (0, common_1.Patch)('bonus-rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Update bonus rule' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.CreateBonusRuleDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateBonusRule", null);
__decorate([
    (0, common_1.Delete)('bonus-rules/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SA),
    (0, swagger_1.ApiOperation)({ summary: 'System Admin: Delete bonus rule' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteBonusRule", null);
__decorate([
    (0, common_1.Get)('cycles/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Any: Get active cycle' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getActiveCycle", null);
__decorate([
    (0, common_1.Get)('cycles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR, ...MANAGER, ...SA),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager/SA: List all cycles' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getCycles", null);
__decorate([
    (0, common_1.Post)('cycles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, ...SA),
    (0, swagger_1.ApiOperation)({ summary: 'HR/SA: Create cycle' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateCycleDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createCycle", null);
__decorate([
    (0, common_1.Patch)('cycles/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, ...SA),
    (0, swagger_1.ApiOperation)({ summary: 'HR/SA: Update cycle' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.PatchCycleDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "patchCycle", null);
__decorate([
    (0, common_1.Delete)('cycles/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, ...SA),
    (0, swagger_1.ApiOperation)({ summary: 'HR/SA: Delete cycle (only if no associated data)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteCycle", null);
__decorate([
    (0, common_1.Get)('goals/my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: My goals' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMyGoals", null);
__decorate([
    (0, common_1.Get)('goals/team'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Team goals' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getTeamGoals", null);
__decorate([
    (0, common_1.Get)('goals/all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: All goals' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getAllGoals", null);
__decorate([
    (0, common_1.Post)('goals'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE, ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Employee/Manager: Create goal' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateGoalDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createGoal", null);
__decorate([
    (0, common_1.Patch)('goals/:id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approve goal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "approveGoal", null);
__decorate([
    (0, common_1.Patch)('goals/:id/reject'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Reject goal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.RejectGoalDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "rejectGoal", null);
__decorate([
    (0, common_1.Get)('goals/:id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Any: Goal progress history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getGoalProgress", null);
__decorate([
    (0, common_1.Post)('goals/:id/progress'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE, ...MANAGER, ...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Employee/Manager/HR: Log goal progress' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.GoalProgressDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "addGoalProgress", null);
__decorate([
    (0, common_1.Patch)('goals/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE, ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Employee/Manager: Update goal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.PatchGoalDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "patchGoal", null);
__decorate([
    (0, common_1.Delete)('goals/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE, ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Employee/Manager: Delete goal (only PENDING or REJECTED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteGoal", null);
__decorate([
    (0, common_1.Get)('evaluations/my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: My evaluations' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMyEvaluations", null);
__decorate([
    (0, common_1.Get)('evaluations/my/history'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Evaluation history' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMyEvaluationHistory", null);
__decorate([
    (0, common_1.Get)('evaluations/team'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Team evaluations' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getTeamEvaluations", null);
__decorate([
    (0, common_1.Get)('evaluations/all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: All evaluations' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getAllEvaluations", null);
__decorate([
    (0, common_1.Get)('evaluations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Any: Get evaluation by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getEvaluationById", null);
__decorate([
    (0, common_1.Post)('evaluations'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Submit evaluation' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateEvaluationDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createEvaluation", null);
__decorate([
    (0, common_1.Patch)('evaluations/:id/submit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Submit evaluation to HR' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "submitEvaluation", null);
__decorate([
    (0, common_1.Patch)('evaluations/:id/countersign'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Countersign evaluation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "countersignEvaluation", null);
__decorate([
    (0, common_1.Patch)('evaluations/:id/acknowledge'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Acknowledge evaluation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "acknowledgeEvaluation", null);
__decorate([
    (0, common_1.Get)('evaluations/:eval_id/comments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER, ...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Manager/HR: Get evaluation comments' }),
    __param(0, (0, common_1.Param)('eval_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getEvaluationComments", null);
__decorate([
    (0, common_1.Post)('evaluations/:eval_id/comments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER, ...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Manager/HR: Add comment to evaluation' }),
    __param(0, (0, common_1.Param)('eval_id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.AddCommentDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "addEvaluationComment", null);
__decorate([
    (0, common_1.Get)('violations/detailed'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Violations with details' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getViolationsDetailed", null);
__decorate([
    (0, common_1.Get)('violations/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Violation stats by severity' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getViolationStats", null);
__decorate([
    (0, common_1.Get)('violations'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR, ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: List violations' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getViolations", null);
__decorate([
    (0, common_1.Post)('violations'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, 'HR Recruiter', ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Log violation' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateViolationDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createViolation", null);
__decorate([
    (0, common_1.Post)('violations/upload-evidence'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, 'HR Recruiter', ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Upload violation evidence file' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 10 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "uploadViolationEvidence", null);
__decorate([
    (0, common_1.Post)('documents/upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, ...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Upload performance document (signed eval or PIP agreement)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 20 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "uploadPerformanceDocument", null);
__decorate([
    (0, common_1.Patch)('violations/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Update violation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.PatchViolationDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "patchViolation", null);
__decorate([
    (0, common_1.Get)('pip/my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: My PIPs' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMyPip", null);
__decorate([
    (0, common_1.Get)('pip/team'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Team PIPs' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getTeamPip", null);
__decorate([
    (0, common_1.Get)('pip/all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: All PIPs' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getAllPip", null);
__decorate([
    (0, common_1.Get)('pip/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Any: Get PIP by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getPipById", null);
__decorate([
    (0, common_1.Post)('pip'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Initiate PIP' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreatePipDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createPip", null);
__decorate([
    (0, common_1.Patch)('pip/:id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approve PIP' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "approvePip", null);
__decorate([
    (0, common_1.Patch)('pip/:id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER, ...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Manager/HR: Update PIP status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "patchPipStatus", null);
__decorate([
    (0, common_1.Get)('pip/:pip_id/updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Any: Get PIP updates' }),
    __param(0, (0, common_1.Param)('pip_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getPipUpdates", null);
__decorate([
    (0, common_1.Post)('pip/:pip_id/updates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Submit PIP progress update' }),
    __param(0, (0, common_1.Param)('pip_id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.PipUpdateDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createPipUpdate", null);
__decorate([
    (0, common_1.Patch)('pip-updates/:update_id/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Review PIP update' }),
    __param(0, (0, common_1.Param)('update_id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.ReviewPipUpdateDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "reviewPipUpdate", null);
__decorate([
    (0, common_1.Get)('rewards'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: List all rewards' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getRewards", null);
__decorate([
    (0, common_1.Patch)('rewards/sync-all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Sync all rewards to payroll' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "syncAllRewards", null);
__decorate([
    (0, common_1.Patch)('rewards/:id/sync'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Sync single reward to payroll' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "syncReward", null);
__decorate([
    (0, common_1.Get)('employee/dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Performance dashboard' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getEmployeeDashboard", null);
__decorate([
    (0, common_1.Get)('manager/dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Team performance dashboard' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getManagerDashboard", null);
__decorate([
    (0, common_1.Get)('manager/team'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: Team member performance overview' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getManagerTeam", null);
__decorate([
    (0, common_1.Get)('hr/dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Performance dashboard' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getHrDashboard", null);
__decorate([
    (0, common_1.Get)('hr/approvals'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approval inbox' }),
    (0, swagger_1.ApiQuery)({ name: 'tab', required: false }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('tab')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getHrApprovals", null);
__decorate([
    (0, common_1.Patch)('hr/approvals/:id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Approve item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.ApproveItemDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "approveHrItem", null);
__decorate([
    (0, common_1.Patch)('hr/approvals/:id/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR: Review item (approve or reject with comment)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, performance_dto_1.ReviewItemDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "reviewHrItem", null);
__decorate([
    (0, common_1.Get)('activity-logs'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_ONLY, ...SA),
    (0, swagger_1.ApiOperation)({ summary: 'HR/SA: Activity logs' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getActivityLogs", null);
__decorate([
    (0, common_1.Get)('self-assessment/my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get my self-assessment for active cycle' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getMySelfAssessment", null);
__decorate([
    (0, common_1.Post)('self-assessment'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Submit or update self-assessment' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, performance_dto_1.CreateSelfAssessmentDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createOrUpdateSelfAssessment", null);
__decorate([
    (0, common_1.Get)('self-assessment/user/:user_id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Manager: View team member self-assessment' }),
    __param(0, (0, common_1.Param)('user_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getSelfAssessmentByUser", null);
__decorate([
    (0, common_1.Get)('settings/labels'),
    (0, swagger_1.ApiOperation)({ summary: 'Any authenticated user: Get rating scale labels' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getRatingLabels", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, swagger_1.ApiTags)('Performance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('performance'),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map