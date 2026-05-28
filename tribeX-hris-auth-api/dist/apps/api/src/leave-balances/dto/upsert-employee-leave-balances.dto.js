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
exports.UpsertEmployeeLeaveBalancesDto = exports.LeaveBalanceItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const leave_categories_1 = require("../leave-categories");
class LeaveBalanceItemDto {
    leave_category;
    entitled_days;
}
exports.LeaveBalanceItemDto = LeaveBalanceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: leave_categories_1.LeaveCategory }),
    (0, class_validator_1.IsEnum)(leave_categories_1.LeaveCategory),
    __metadata("design:type", String)
], LeaveBalanceItemDto.prototype, "leave_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LeaveBalanceItemDto.prototype, "entitled_days", void 0);
class UpsertEmployeeLeaveBalancesDto {
    items;
}
exports.UpsertEmployeeLeaveBalancesDto = UpsertEmployeeLeaveBalancesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LeaveBalanceItemDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LeaveBalanceItemDto),
    __metadata("design:type", Array)
], UpsertEmployeeLeaveBalancesDto.prototype, "items", void 0);
//# sourceMappingURL=upsert-employee-leave-balances.dto.js.map