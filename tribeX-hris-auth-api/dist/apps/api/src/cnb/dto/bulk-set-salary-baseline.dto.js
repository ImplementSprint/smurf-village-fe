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
exports.BulkSetSalaryBaselineDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class BulkSetSalaryBaselineDto {
    basic_salary;
    pay_frequency;
    effective_date;
    employee_ids;
    only_missing;
}
exports.BulkSetSalaryBaselineDto = BulkSetSalaryBaselineDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Basic salary amount for all employees',
        example: 25000,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkSetSalaryBaselineDto.prototype, "basic_salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pay frequency (monthly, semi-monthly, weekly, daily)',
        example: 'monthly',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkSetSalaryBaselineDto.prototype, "pay_frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Effective date for salary baseline (ISO format)',
        example: '2026-01-01',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkSetSalaryBaselineDto.prototype, "effective_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional: Only set salary for specific employee IDs',
        example: ['emp-001', 'emp-002'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BulkSetSalaryBaselineDto.prototype, "employee_ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional: Only set salary for employees missing one',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkSetSalaryBaselineDto.prototype, "only_missing", void 0);
//# sourceMappingURL=bulk-set-salary-baseline.dto.js.map