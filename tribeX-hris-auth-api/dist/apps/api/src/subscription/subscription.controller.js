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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const create_checkout_dto_1 = require("./dto/create-checkout.dto");
const payment_confirm_dto_1 = require("./dto/payment-confirm.dto");
const register_company_dto_1 = require("./dto/register-company.dto");
const select_plan_dto_1 = require("./dto/select-plan.dto");
const subscription_service_1 = require("./subscription.service");
let SubscriptionController = class SubscriptionController {
    subscriptionService;
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    getPlans() {
        return this.subscriptionService.getPlans();
    }
    register(dto) {
        return this.subscriptionService.register(dto);
    }
    selectPlan(dto) {
        return this.subscriptionService.selectPlan(dto);
    }
    createCheckout(dto) {
        return this.subscriptionService.createCheckout(dto);
    }
    confirmPayment(dto) {
        return this.subscriptionService.confirmPayment(dto);
    }
    getStatus(id) {
        return this.subscriptionService.getRegistrationStatus(id);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "getPlans", null);
__decorate([
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_company_dto_1.RegisterCompanyDto]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('select-plan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [select_plan_dto_1.SelectPlanDto]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "selectPlan", null);
__decorate([
    (0, common_1.Post)('payment/create-checkout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_checkout_dto_1.CreateCheckoutDto]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('payment/confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_confirm_dto_1.PaymentConfirmDto]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)('registration/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionController.prototype, "getStatus", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map