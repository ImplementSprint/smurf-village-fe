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
exports.ManagerOffboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const offboarding_service_1 = require("./offboarding.service");
const update_status_dto_1 = require("./dto/update-status.dto");
const update_knowledge_transfer_dto_1 = require("./dto/update-knowledge-transfer.dto");
const MANAGER_UP = ['Manager', 'HR Officer', 'HR Recruiter', 'Admin', 'System Admin'];
let ManagerOffboardingController = class ManagerOffboardingController {
    offboardingService;
    constructor(offboardingService) {
        this.offboardingService = offboardingService;
    }
    getAllCases() {
        return this.offboardingService.getAllCases();
    }
    getCase(caseId) {
        return this.offboardingService.getCaseById(caseId);
    }
    updateStatus(caseId, dto, req) {
        return this.offboardingService.updateStatus(caseId, dto.status, req.user);
    }
    updateKT(caseId, dto, req) {
        return this.offboardingService.updateKnowledgeTransfer(caseId, dto, req.user.sub_userid);
    }
};
exports.ManagerOffboardingController = ManagerOffboardingController;
__decorate([
    (0, common_1.Get)('cases'),
    (0, roles_decorator_1.Roles)(...MANAGER_UP),
    (0, swagger_1.ApiOperation)({ summary: 'List all offboarding cases visible to manager' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ManagerOffboardingController.prototype, "getAllCases", null);
__decorate([
    (0, common_1.Get)('cases/:caseId'),
    (0, roles_decorator_1.Roles)(...MANAGER_UP),
    (0, swagger_1.ApiOperation)({ summary: 'Get full detail of an offboarding case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ManagerOffboardingController.prototype, "getCase", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/status'),
    (0, roles_decorator_1.Roles)(...MANAGER_UP),
    (0, swagger_1.ApiOperation)({ summary: 'Update case status (Manager can set Manager_Acknowledged)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateOffboardingStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ManagerOffboardingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/knowledge-transfer'),
    (0, roles_decorator_1.Roles)(...MANAGER_UP),
    (0, swagger_1.ApiOperation)({ summary: 'Manager signs off on or updates knowledge transfer' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_knowledge_transfer_dto_1.UpdateKnowledgeTransferDto, Object]),
    __metadata("design:returntype", void 0)
], ManagerOffboardingController.prototype, "updateKT", null);
exports.ManagerOffboardingController = ManagerOffboardingController = __decorate([
    (0, swagger_1.ApiTags)('Manager Offboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('offboarding/manager'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offboarding_service_1.OffboardingService])
], ManagerOffboardingController);
//# sourceMappingURL=manager-offboarding.controller.js.map