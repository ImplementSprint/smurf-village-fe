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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectPlanDto = void 0;
const class_validator_1 = require("class-validator");
class SelectPlanDto {
    registration_id;
    subscription_plan;
    billing_cycle;
}
exports.SelectPlanDto = SelectPlanDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SelectPlanDto.prototype, "registration_id", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['monthly', 'annual']),
    __metadata("design:type", String)
], SelectPlanDto.prototype, "subscription_plan", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['monthly', 'annual']),
    __metadata("design:type", String)
], SelectPlanDto.prototype, "billing_cycle", void 0);
//# sourceMappingURL=select-plan.dto.js.map