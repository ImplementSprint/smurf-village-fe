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
exports.CompanyDefaultLeaveBalancesDto = exports.CompanyDefaultItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const leave_categories_1 = require("../leave-categories");
class CompanyDefaultItemDto {
    leave_category;
    default_days;
}
exports.CompanyDefaultItemDto = CompanyDefaultItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: leave_categories_1.LeaveCategory }),
    (0, class_validator_1.IsEnum)(leave_categories_1.LeaveCategory),
    __metadata("design:type", String)
], CompanyDefaultItemDto.prototype, "leave_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompanyDefaultItemDto.prototype, "default_days", void 0);
class CompanyDefaultLeaveBalancesDto {
    items;
}
exports.CompanyDefaultLeaveBalancesDto = CompanyDefaultLeaveBalancesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CompanyDefaultItemDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CompanyDefaultItemDto),
    __metadata("design:type", Array)
], CompanyDefaultLeaveBalancesDto.prototype, "items", void 0);
//# sourceMappingURL=company-default-leave-balances.dto.js.map