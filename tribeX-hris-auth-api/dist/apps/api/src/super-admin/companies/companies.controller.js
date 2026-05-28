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
exports.SuperAdminCompaniesController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_guard_1 = require("../super-admin.guard");
const companies_service_1 = require("./companies.service");
const update_company_status_dto_1 = require("./dto/update-company-status.dto");
let SuperAdminCompaniesController = class SuperAdminCompaniesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(query) {
        return this.service.list({
            status: query.status, plan: query.plan, industry: query.industry,
            from: query.from, to: query.to,
            page: query.page ? +query.page : 1,
            limit: query.limit ? +query.limit : 20,
        });
    }
    detail(id) {
        return this.service.detail(id);
    }
    updateStatus(id, dto, req) {
        return this.service.updateStatus(id, dto.subscription_status, req.user.sub);
    }
    provision(id, req) {
        return this.service.provision(id, req.user.sub);
    }
};
exports.SuperAdminCompaniesController = SuperAdminCompaniesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminCompaniesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':company_id'),
    __param(0, (0, common_1.Param)('company_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminCompaniesController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)(':registration_id/status'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_company_status_dto_1.UpdateCompanyStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminCompaniesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':registration_id/provision'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminCompaniesController.prototype, "provision", null);
exports.SuperAdminCompaniesController = SuperAdminCompaniesController = __decorate([
    (0, common_1.Controller)('super-admin/companies'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [companies_service_1.SuperAdminCompaniesService])
], SuperAdminCompaniesController);
//# sourceMappingURL=companies.controller.js.map