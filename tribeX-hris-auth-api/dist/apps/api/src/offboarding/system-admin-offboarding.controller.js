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
exports.SystemAdminOffboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const offboarding_service_1 = require("./offboarding.service");
const configure_checklist_template_dto_1 = require("./dto/configure-checklist-template.dto");
const SYSTEM_ADMIN_ONLY = ['System Admin'];
let SystemAdminOffboardingController = class SystemAdminOffboardingController {
    offboardingService;
    constructor(offboardingService) {
        this.offboardingService = offboardingService;
    }
    enable(companyId, req) {
        return this.offboardingService.enableOffboardingModule(companyId, req.user.sub_userid);
    }
    disable(companyId, req) {
        return this.offboardingService.disableOffboardingModule(companyId, req.user.sub_userid);
    }
    getAuditLogs(company_id, employee_id) {
        return this.offboardingService.getOffboardingAuditLogs({ company_id, employee_id });
    }
    configureTemplate(companyId, dto, req) {
        return this.offboardingService.configureChecklistTemplate(dto, companyId, req.user.sub_userid);
    }
    getTemplates(companyId) {
        return this.offboardingService.getChecklistTemplates(companyId);
    }
    getSystemAccessOptions(companyId) {
        return this.offboardingService.getSystemAccessOptions(companyId);
    }
    updateTemplate(companyId, templateId, dto, req) {
        return this.offboardingService.updateChecklistTemplate(templateId, dto, companyId, req.user.sub_userid);
    }
    deleteTemplate(companyId, templateId, req) {
        return this.offboardingService.deleteChecklistTemplate(templateId, companyId, req.user.sub_userid);
    }
};
exports.SystemAdminOffboardingController = SystemAdminOffboardingController;
__decorate([
    (0, common_1.Post)('tenants/:companyId/enable'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Enable offboarding module for a company tenant' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "enable", null);
__decorate([
    (0, common_1.Post)('tenants/:companyId/disable'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Disable offboarding module for a company tenant' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "disable", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'View offboarding activity logs across all tenants (Phase 3)' }),
    __param(0, (0, common_1.Query)('company_id')),
    __param(1, (0, common_1.Query)('employee_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Post)('tenants/:companyId/checklist-templates'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Configure offboarding checklist template for a tenant as System Admin' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, configure_checklist_template_dto_1.ConfigureChecklistTemplateDto, Object]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "configureTemplate", null);
__decorate([
    (0, common_1.Get)('tenants/:companyId/checklist-templates'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get offboarding checklist templates for a tenant as System Admin' }),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('tenants/:companyId/system-access-options'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Get system access options for a tenant as System Admin' }),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "getSystemAccessOptions", null);
__decorate([
    (0, common_1.Patch)('tenants/:companyId/checklist-templates/:templateId'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Update an offboarding checklist template for a tenant as System Admin' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('templateId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, configure_checklist_template_dto_1.ConfigureChecklistTemplateDto, Object]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('tenants/:companyId/checklist-templates/:templateId'),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an offboarding checklist template for a tenant as System Admin' }),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('templateId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SystemAdminOffboardingController.prototype, "deleteTemplate", null);
exports.SystemAdminOffboardingController = SystemAdminOffboardingController = __decorate([
    (0, swagger_1.ApiTags)('System Admin Offboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('offboarding/system-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offboarding_service_1.OffboardingService])
], SystemAdminOffboardingController);
//# sourceMappingURL=system-admin-offboarding.controller.js.map