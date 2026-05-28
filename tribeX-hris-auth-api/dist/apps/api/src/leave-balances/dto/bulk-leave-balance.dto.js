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
exports.BulkLeaveBalanceDto = exports.BulkLeaveItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const leave_categories_1 = require("../leave-categories");
class BulkLeaveItemDto {
    leave_category;
    entitled_days;
}
exports.BulkLeaveItemDto = BulkLeaveItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: leave_categories_1.LeaveCategory }),
    (0, class_validator_1.IsEnum)(leave_categories_1.LeaveCategory),
    __metadata("design:type", String)
], BulkLeaveItemDto.prototype, "leave_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkLeaveItemDto.prototype, "entitled_days", void 0);
class BulkLeaveBalanceDto {
    scope;
    department_id;
    user_ids;
    items;
}
exports.BulkLeaveBalanceDto = BulkLeaveBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['company', 'department', 'employees'] }),
    (0, class_validator_1.IsIn)(['company', 'department', 'employees']),
    __metadata("design:type", String)
], BulkLeaveBalanceDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required when scope=department' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkLeaveBalanceDto.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required when scope=employees', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkLeaveBalanceDto.prototype, "user_ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BulkLeaveItemDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkLeaveItemDto),
    __metadata("design:type", Array)
], BulkLeaveBalanceDto.prototype, "items", void 0);
//# sourceMappingURL=bulk-leave-balance.dto.js.map