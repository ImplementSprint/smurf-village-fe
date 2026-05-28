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
exports.EmployeeOffboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const offboarding_service_1 = require("./offboarding.service");
const create_case_dto_1 = require("./dto/create-case.dto");
const update_knowledge_transfer_dto_1 = require("./dto/update-knowledge-transfer.dto");
const ALL_STAFF = ['Employee', 'Manager', 'HR Officer', 'HR Recruiter', 'Admin', 'System Admin'];
let EmployeeOffboardingController = class EmployeeOffboardingController {
    offboardingService;
    constructor(offboardingService) {
        this.offboardingService = offboardingService;
    }
    createCase(dto, req) {
        return this.offboardingService.createCase(dto, req.user.sub_userid);
    }
    getMyCase(req) {
        return this.offboardingService.getMyCaseByEmployeeId(req.user.sub_userid);
    }
    getChecklist(caseId) {
        return this.offboardingService.getChecklist(caseId);
    }
    acknowledgeAsset(_caseId, itemId, body, req) {
        return this.offboardingService.acknowledgeAssetReturn(itemId, req.user.sub_userid, body.proof_url);
    }
    updateKT(caseId, dto, req) {
        return this.offboardingService.updateKnowledgeTransfer(caseId, dto, req.user.sub_userid);
    }
    getFinalPay(caseId) {
        return this.offboardingService.getFinalPay(caseId);
    }
    getClearanceDocs(caseId) {
        return this.offboardingService.getClearanceDocuments(caseId);
    }
};
exports.EmployeeOffboardingController = EmployeeOffboardingController;
__decorate([
    (0, common_1.Post)('cases'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a resignation (employee initiates)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_case_dto_1.CreateOffboardingCaseDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)('cases/my'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Get my own active offboarding case with full status' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "getMyCase", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/checklist'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'View offboarding checklist assigned to me' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "getChecklist", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/checklist/:itemId/acknowledge'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Acknowledge return of a company asset with proof (sets item to Verified)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "acknowledgeAsset", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/knowledge-transfer'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Employee writes knowledge transfer / handover notes' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_knowledge_transfer_dto_1.UpdateKnowledgeTransferDto, Object]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "updateKT", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/final-pay'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'View final pay breakdown' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "getFinalPay", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/clearance-documents'),
    (0, roles_decorator_1.Roles)(...ALL_STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'View clearance document status (Pending or Released)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeOffboardingController.prototype, "getClearanceDocs", null);
exports.EmployeeOffboardingController = EmployeeOffboardingController = __decorate([
    (0, swagger_1.ApiTags)('Employee Offboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('offboarding/employee'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offboarding_service_1.OffboardingService])
], EmployeeOffboardingController);
//# sourceMappingURL=employee-offboarding.controller.js.map