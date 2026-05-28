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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const users_service_1 = require("./users.service");
const create_users_dto_1 = require("./dto/create-users.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const create_change_request_dto_1 = require("./dto/create-change-request.dto");
const review_change_request_dto_1 = require("./dto/review-change-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'HR Compensation and Benefits Officer',
    'HR Offboarding Officer/Coordinator',
    'HR Onboarding Officer',
    'HR Performance Management Officer',
    'Manager',
];
const ADMIN_ONLY = ['Admin', 'System Admin'];
const SYSTEM_ADMIN_ONLY = ['System Admin'];
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMyCompany(req) {
        return this.usersService.getCompanyInfo(req.user.company_id);
    }
    findAll(req) {
        return this.usersService.findAll(req.user.company_id);
    }
    getRoles(req) {
        return this.usersService.getRoles(req.user.company_id);
    }
    async createDepartment(name, req) {
        if (!name?.trim())
            throw new common_1.BadRequestException('Department name is required.');
        return this.usersService.createDepartment(name.trim(), req.user.company_id, req.user.sub_userid);
    }
    stats(req) {
        return this.usersService.stats(req.user.company_id);
    }
    getDepartments(req) {
        return this.usersService.getDepartments(req.user.company_id);
    }
    async renameDepartment(id, name, req) {
        if (!name?.trim())
            throw new common_1.BadRequestException('Department name is required.');
        return this.usersService.renameDepartment(id, name.trim(), req.user.company_id, req.user.sub_userid);
    }
    async deleteDepartment(id, req) {
        return this.usersService.deleteDepartment(id, req.user.company_id, req.user.sub_userid);
    }
    getCompanies(req) {
        return this.usersService.getCompanies(req.user.company_id);
    }
    getLifecyclePermissions(req) {
        return this.usersService.getLifecyclePermissions(req.user.company_id);
    }
    saveLifecyclePermissions(modules, req) {
        if (!Array.isArray(modules)) {
            throw new common_1.BadRequestException('Request body must be an array.');
        }
        return this.usersService.saveLifecyclePermissions(modules, req.user.company_id, req.user.sub_userid);
    }
    getTenantConfig(req) {
        return this.usersService.getTenantConfig(req.user.company_id);
    }
    updateTenantConfig(req, body) {
        if (req.user.role_name !== 'System Admin') {
            throw new common_1.UnauthorizedException('Only System Admins can update tenant configuration');
        }
        return this.usersService.updateTenantConfig(req.user.company_id, body, req.user.sub_userid);
    }
    getTenantModules(req) {
        return this.usersService.getTenantModules(req.user.company_id);
    }
    updateTenantModule(req, module, status) {
        if (req.user.role_name !== 'System Admin') {
            throw new common_1.UnauthorizedException('Only System Admins can manage HR modules');
        }
        if (status !== 'Active' && status !== 'Inactive') {
            throw new common_1.BadRequestException('status must be "Active" or "Inactive"');
        }
        return this.usersService.updateTenantModule(req.user.company_id, module, status, req.user.sub_userid);
    }
    getMyAccessibleModules(req) {
        return this.usersService.getMyAccessibleModules(req.user.role_id, req.user.company_id);
    }
    submitChangeRequest(req, dto) {
        return this.usersService.submitChangeRequest(req.user.sub_userid, req.user.company_id, dto);
    }
    getMyChangeRequests(req) {
        return this.usersService.getMyChangeRequests(req.user.sub_userid);
    }
    getChangeRequests(req, status) {
        return this.usersService.getChangeRequestsForCompany(req.user.company_id, status);
    }
    reviewChangeRequest(requestId, req, dto) {
        return this.usersService.reviewChangeRequest(requestId, req.user.sub_userid, req.user.company_id, dto);
    }
    getMe(req) {
        return this.usersService.getMe(req.user.sub_userid);
    }
    updateMe(req, body) {
        return this.usersService.updateMe(req.user.sub_userid, body);
    }
    getOnboardingStaging(req) {
        return this.usersService.getOnboardingStaging(req.user.sub_userid);
    }
    updateMyEmergencyContacts(req, body) {
        return this.usersService.updateEmergencyContacts(req.user.sub_userid, body.emergency_contacts ?? []);
    }
    findOne(id, req) {
        return this.usersService.findOne(id, req.user.company_id);
    }
    create(createUserDto, req) {
        const companyId = createUserDto.company_id ?? req.user.company_id;
        if (!companyId)
            throw new common_1.BadRequestException('Your account has no company assignment.');
        return this.usersService.create(createUserDto, companyId, req.user.sub_userid);
    }
    update(id, updateUserDto, req) {
        return this.usersService.update(id, updateUserDto, req.user.company_id, req.user.sub_userid);
    }
    async remove(id, req) {
        return this.usersService.remove(id, req.user.company_id, req.user.sub_userid);
    }
    async assignCompanyEmail(id, email, req) {
        if (!email?.trim())
            throw new common_1.BadRequestException('email is required');
        return this.usersService.assignCompanyEmail(id, email.trim().toLowerCase(), req.user.company_id, req.user.sub_userid);
    }
    async resendInvite(id, req) {
        return this.usersService.resendInvite(id, req.user.company_id ?? '', req.user.sub_userid);
    }
    async reactivate(id, req) {
        return this.usersService.reactivate(id, req.user.company_id, req.user.sub_userid);
    }
    getMyDocuments(req) {
        return this.usersService.getMyDocuments(req.user.sub_userid);
    }
    uploadEmployeeDocument(req, file, docType) {
        if (!docType)
            throw new common_1.BadRequestException('document_type is required.');
        return this.usersService.uploadEmployeeDocument(req.user.sub_userid, docType, file);
    }
    deleteEmployeeDocument(req, id) {
        return this.usersService.deleteEmployeeDocument(req.user.sub_userid, id);
    }
    getPendingDocuments(req) {
        return this.usersService.getPendingEmployeeDocuments(req.user.company_id);
    }
    approveDocument(id, req) {
        return this.usersService.approveEmployeeDocument(id, req.user.sub_userid);
    }
    rejectDocument(id, req, hrNotes) {
        if (!hrNotes)
            throw new common_1.BadRequestException('hr_notes is required when rejecting.');
        return this.usersService.rejectEmployeeDocument(id, req.user.sub_userid, hrNotes);
    }
    submitDocumentReplacement(req, id, files, reason) {
        if (!files?.file?.[0])
            throw new common_1.BadRequestException('file is required.');
        if (!reason?.trim())
            throw new common_1.BadRequestException('reason is required.');
        return this.usersService.submitDocumentReplacement(req.user.sub_userid, id, reason.trim(), files.file[0], files.proof_file?.[0]);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('company/me'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyCompany", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getRoles", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ADMIN_ONLY),
    (0, common_1.Post)('departments'),
    __param(0, (0, common_1.Body)('department_name')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ADMIN_ONLY),
    (0, common_1.Patch)('departments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('department_name')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "renameDepartment", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ADMIN_ONLY),
    (0, common_1.Delete)('departments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteDepartment", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ADMIN_ONLY),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)('hr-lifecycle/permissions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getLifecyclePermissions", null);
__decorate([
    (0, common_1.Put)('hr-lifecycle/permissions'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "saveLifecyclePermissions", null);
__decorate([
    (0, common_1.Get)('tenant-config'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getTenantConfig", null);
__decorate([
    (0, common_1.Patch)('tenant-config'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateTenantConfig", null);
__decorate([
    (0, common_1.Get)('tenant-modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getTenantModules", null);
__decorate([
    (0, common_1.Patch)('tenant-modules/:module'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('module')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateTenantModule", null);
__decorate([
    (0, common_1.Get)('me/accessible-modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyAccessibleModules", null);
__decorate([
    (0, common_1.Post)('me/change-requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_change_request_dto_1.CreateChangeRequestDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "submitChangeRequest", null);
__decorate([
    (0, common_1.Get)('me/change-requests'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyChangeRequests", null);
__decorate([
    (0, common_1.Get)('change-requests'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HR Officer', 'HR Recruiter', 'Admin', 'System Admin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getChangeRequests", null);
__decorate([
    (0, common_1.Patch)('change-requests/:requestId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('HR Officer', 'HR Recruiter', 'Admin', 'System Admin'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_change_request_dto_1.ReviewChangeRequestDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "reviewChangeRequest", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Get)('me/onboarding-staging'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getOnboardingStaging", null);
__decorate([
    (0, common_1.Patch)('me/emergency-contacts'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMyEmergencyContacts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ADMIN_ONLY),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_users_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.Patch)(':id/assign-email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignCompanyEmail", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.Patch)(':id/resend-invite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resendInvite", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, common_1.Patch)(':id/reactivate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Get)('me/documents'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyDocuments", null);
__decorate([
    (0, common_1.Post)('me/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('document_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadEmployeeDocument", null);
__decorate([
    (0, common_1.Delete)('me/documents/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteEmployeeDocument", null);
__decorate([
    (0, common_1.Get)('documents/pending'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getPendingDocuments", null);
__decorate([
    (0, common_1.Patch)('documents/:id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "approveDocument", null);
__decorate([
    (0, common_1.Patch)('documents/:id/reject'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('hr_notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "rejectDocument", null);
__decorate([
    (0, common_1.Patch)('documents/:id/replace-request'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'file', maxCount: 1 }, { name: 'proof_file', maxCount: 1 }], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "submitDocumentReplacement", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map