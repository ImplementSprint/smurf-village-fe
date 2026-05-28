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
exports.SuperAdminSubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_guard_1 = require("../super-admin.guard");
const subscriptions_service_1 = require("./subscriptions.service");
const update_subscription_status_dto_1 = require("./dto/update-subscription-status.dto");
let SuperAdminSubscriptionsController = class SuperAdminSubscriptionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(query) {
        return this.service.list({
            status: query.status, billing_cycle: query.billing_cycle,
            page: query.page ? +query.page : 1, limit: query.limit ? +query.limit : 20,
        });
    }
    detail(id) { return this.service.detail(id); }
    updateStatus(id, dto, req) {
        return this.service.updateStatus(id, dto.subscription_status, req.user.sub);
    }
    paymentHistory(id) { return this.service.paymentHistory(id); }
};
exports.SuperAdminSubscriptionsController = SuperAdminSubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminSubscriptionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':registration_id'),
    __param(0, (0, common_1.Param)('registration_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminSubscriptionsController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)(':registration_id/status'),
    __param(0, (0, common_1.Param)('registration_id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_status_dto_1.UpdateSubscriptionStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminSubscriptionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':registration_id/payment-history'),
    __param(0, (0, common_1.Param)('registration_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminSubscriptionsController.prototype, "paymentHistory", null);
exports.SuperAdminSubscriptionsController = SuperAdminSubscriptionsController = __decorate([
    (0, common_1.Controller)('super-admin/subscriptions'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [subscriptions_service_1.SuperAdminSubscriptionsService])
], SuperAdminSubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map