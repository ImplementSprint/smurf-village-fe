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
exports.HrOffboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const offboarding_service_1 = require("./offboarding.service");
const create_case_dto_1 = require("./dto/create-case.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const update_checklist_item_dto_1 = require("./dto/update-checklist-item.dto");
const update_final_pay_dto_1 = require("./dto/update-final-pay.dto");
const accept_reject_case_dto_1 = require("./dto/accept-reject-case.dto");
const configure_checklist_template_dto_1 = require("./dto/configure-checklist-template.dto");
const release_clearance_dto_1 = require("./dto/release-clearance.dto");
const HR_ONLY = [
    'HR Officer',
    'HR Offboarding Officer/Coordinator',
    'Admin',
    'System Admin',
];
let HrOffboardingController = class HrOffboardingController {
    offboardingService;
    constructor(offboardingService) {
        this.offboardingService = offboardingService;
    }
    configureTemplate(dto, req) {
        return this.offboardingService.configureChecklistTemplate(dto, req.user.company_id, req.user.sub_userid);
    }
    getTemplates(req) {
        return this.offboardingService.getChecklistTemplates(req.user.company_id);
    }
    createCase(dto, req) {
        return this.offboardingService.createCase(dto, req.user.sub_userid);
    }
    getAllCases(status, offboarding_type) {
        return this.offboardingService.getAllCases({ status, offboarding_type });
    }
    getCase(caseId) {
        return this.offboardingService.getCaseById(caseId);
    }
    acceptRejectCase(caseId, dto, req) {
        return this.offboardingService.acceptRejectCase(caseId, dto.action, req.user.sub_userid, dto.rejection_reason, dto.template_id);
    }
    updateStatus(caseId, dto, req) {
        return this.offboardingService.updateStatus(caseId, dto.status, req.user);
    }
    getChecklist(caseId) {
        return this.offboardingService.getChecklist(caseId);
    }
    addChecklistItem(caseId, item_name) {
        return this.offboardingService.addChecklistItem(caseId, item_name);
    }
    updateChecklistItem(_caseId, itemId, dto, req) {
        return this.offboardingService.updateChecklistItem(itemId, dto.status, req.user.sub_userid);
    }
    getKT(caseId) {
        return this.offboardingService.getKnowledgeTransfer(caseId);
    }
    getSystemAccess(caseId) {
        return this.offboardingService.getSystemAccess(caseId);
    }
    addSystemAccess(caseId, system_name) {
        return this.offboardingService.addSystemAccess(caseId, system_name);
    }
    revokeAccess(_caseId, accessId, req) {
        return this.offboardingService.revokeSystemAccess(accessId, req.user.sub_userid);
    }
    getFinalPay(caseId) {
        return this.offboardingService.getFinalPay(caseId);
    }
    updateFinalPay(caseId, dto) {
        return this.offboardingService.updateFinalPay(caseId, dto);
    }
    recomputeFinalPay(caseId) {
        return this.offboardingService.recomputeFinalPayManual(caseId);
    }
    releaseFinalPay(caseId) {
        return this.offboardingService.releaseFinalPay(caseId);
    }
    confirmTransfer(caseId, req) {
        return this.offboardingService.recordPayTransferConfirmation(caseId, req.user.sub_userid);
    }
    getClearanceDocs(caseId) {
        return this.offboardingService.getClearanceDocuments(caseId);
    }
    releaseClearanceDocs(caseId, dto, req) {
        return this.offboardingService.releaseClearanceDocuments(caseId, req.user.sub_userid, dto.notes);
    }
    triggerJobPosting(caseId, req) {
        return this.offboardingService.triggerJobPosting(caseId, req.user.sub_userid);
    }
    resetCase(caseId, req) {
        return this.offboardingService.resetCase(caseId, req.user.sub_userid);
    }
};
exports.HrOffboardingController = HrOffboardingController;
__decorate([
    (0, common_1.Post)('checklist-templates'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Configure offboarding checklist template for the company' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configure_checklist_template_dto_1.ConfigureChecklistTemplateDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "configureTemplate", null);
__decorate([
    (0, common_1.Get)('checklist-templates'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get all checklist templates for the company' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('cases'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'HR creates a Termination or End of Contract case' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_case_dto_1.CreateOffboardingCaseDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "createCase", null);
__decorate([
    (0, common_1.Get)('cases'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'List all offboarding cases with optional filters' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('offboarding_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getAllCases", null);
__decorate([
    (0, common_1.Get)('cases/:caseId'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get full detail of an offboarding case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getCase", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/review'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Accept or Reject a resignation (HR Phase 3)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accept_reject_case_dto_1.AcceptRejectCaseDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "acceptRejectCase", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/status'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Update case status (HR_Accepted or Completed)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateOffboardingStatusDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/checklist'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get all checklist items for a case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getChecklist", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/checklist'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Add a custom checklist item to a case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)('item_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "addChecklistItem", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/checklist/:itemId'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Update checklist item status (Verified or Disputed)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_checklist_item_dto_1.UpdateChecklistItemDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/knowledge-transfer'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get knowledge transfer record for a case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getKT", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/system-access'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get system access records for a case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getSystemAccess", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/system-access'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Add a system access record manually' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)('system_name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "addSystemAccess", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/system-access/:accessId/revoke'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke access to a system' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Param)('accessId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "revokeAccess", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/final-pay'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get final pay record for a case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getFinalPay", null);
__decorate([
    (0, common_1.Put)('cases/:caseId/final-pay'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Set or update final pay breakdown (total computed server-side)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_final_pay_dto_1.UpdateFinalPayDto]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "updateFinalPay", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/final-pay/recompute'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({
        summary: 'Force recompute final pay from compensation data',
        description: 'Recalculates final pay based on current employee compensation (salary, benefits, leave). Use this if salary baseline was added after case creation.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Final pay recomputed successfully',
        schema: {
            example: {
                pay_id: 'uuid',
                case_id: 'uuid',
                salary_balance: 15000,
                leave_encashment: 2000,
                additional_pay: 1000,
                deductions: 3000,
                total_amount: 15000,
                status: 'Ready for Review',
            },
        },
    }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "recomputeFinalPay", null);
__decorate([
    (0, common_1.Patch)('cases/:caseId/final-pay/release'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Release final pay to employee' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "releaseFinalPay", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/final-pay/confirm-transfer'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Record bank transfer confirmation and create payroll log entry (Phase 10)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "confirmTransfer", null);
__decorate([
    (0, common_1.Get)('cases/:caseId/clearance-documents'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get clearance document status for a case (Phase 12)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "getClearanceDocs", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/clearance-documents/release'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Release clearance documents after all checklist items verified (Phase 11)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, release_clearance_dto_1.ReleaseClearanceDto, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "releaseClearanceDocs", null);
__decorate([
    (0, common_1.Post)('cases/:caseId/trigger-job-posting'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Flag position as vacant and trigger a new job posting (Phase 13)' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "triggerJobPosting", null);
__decorate([
    (0, common_1.Delete)('cases/:caseId'),
    (0, roles_decorator_1.Roles)(...HR_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Reset or delete a non-completed offboarding case' }),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HrOffboardingController.prototype, "resetCase", null);
exports.HrOffboardingController = HrOffboardingController = __decorate([
    (0, swagger_1.ApiTags)('HR Offboarding Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('offboarding/hr'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offboarding_service_1.OffboardingService])
], HrOffboardingController);
//# sourceMappingURL=hr-offboarding.controller.js.map