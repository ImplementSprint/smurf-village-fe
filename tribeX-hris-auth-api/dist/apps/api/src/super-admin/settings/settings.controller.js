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
exports.SuperAdminSettingsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const super_admin_guard_1 = require("../super-admin.guard");
const settings_service_1 = require("./settings.service");
class UpdateProfileDto {
    name;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "name", void 0);
class UpdateNotificationsDto {
    notify_new_signup;
    notify_payment;
    notify_renewal_due;
    notify_expiry;
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationsDto.prototype, "notify_new_signup", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationsDto.prototype, "notify_payment", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationsDto.prototype, "notify_renewal_due", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationsDto.prototype, "notify_expiry", void 0);
class ChangePasswordDto {
    current_password;
    new_password;
    confirm_password;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "current_password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "new_password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "confirm_password", void 0);
let SuperAdminSettingsController = class SuperAdminSettingsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getProfile(req) { return this.service.getProfile(req.user.sub); }
    updateProfile(req, dto) {
        return this.service.updateProfile(req.user.sub, dto.name);
    }
    changePassword(req, dto) {
        if (dto.new_password !== dto.confirm_password) {
            throw new common_1.BadRequestException('New passwords do not match');
        }
        return this.service.changePassword(req.user.sub, req.user.email, dto.current_password, dto.new_password);
    }
    getNotifications(req) { return this.service.getNotifications(req.user.sub); }
    updateNotifications(req, dto) {
        return this.service.updateNotifications(req.user.sub, dto);
    }
    getAuditLog() { return this.service.getAuditLog(); }
    getSystem() { return this.service.getSystemSettings(); }
};
exports.SuperAdminSettingsController = SuperAdminSettingsController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateNotificationsDto]),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "updateNotifications", null);
__decorate([
    (0, common_1.Get)('audit-log'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)('system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminSettingsController.prototype, "getSystem", null);
exports.SuperAdminSettingsController = SuperAdminSettingsController = __decorate([
    (0, common_1.Controller)('super-admin/settings'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [settings_service_1.SuperAdminSettingsService])
], SuperAdminSettingsController);
//# sourceMappingURL=settings.controller.js.map