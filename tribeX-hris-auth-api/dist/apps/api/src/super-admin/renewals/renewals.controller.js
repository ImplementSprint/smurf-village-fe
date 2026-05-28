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
exports.SuperAdminRenewalsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const super_admin_guard_1 = require("../super-admin.guard");
const renewals_service_1 = require("./renewals.service");
class MarkRenewedDto {
    billing_cycle;
}
__decorate([
    (0, class_validator_1.IsIn)(['monthly', 'annual']),
    __metadata("design:type", String)
], MarkRenewedDto.prototype, "billing_cycle", void 0);
let SuperAdminRenewalsController = class SuperAdminRenewalsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(status) { return this.service.list(status); }
    remind(id, req) {
        return this.service.sendReminder(id, req.user.sub);
    }
    markRenewed(id, dto, req) {
        return this.service.markRenewed(id, dto.billing_cycle, req.user.sub);
    }
    suspend(id, req) {
        return this.service.suspend(id, req.user.sub);
    }
};
exports.SuperAdminRenewalsController = SuperAdminRenewalsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminRenewalsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':registration_id/remind'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminRenewalsController.prototype, "remind", null);
__decorate([
    (0, common_1.Patch)(':registration_id/mark-renewed'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MarkRenewedDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminRenewalsController.prototype, "markRenewed", null);
__decorate([
    (0, common_1.Patch)(':registration_id/suspend'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminRenewalsController.prototype, "suspend", null);
exports.SuperAdminRenewalsController = SuperAdminRenewalsController = __decorate([
    (0, common_1.Controller)('super-admin/renewals'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [renewals_service_1.SuperAdminRenewalsService])
], SuperAdminRenewalsController);
//# sourceMappingURL=renewals.controller.js.map