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
exports.ConfigureBenefitDefaultsDto = exports.ConfigureStatutoryDeductionDto = exports.DeductionType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DeductionType;
(function (DeductionType) {
    DeductionType["PERCENTAGE"] = "percentage";
    DeductionType["FIXED_AMOUNT"] = "fixed_amount";
})(DeductionType || (exports.DeductionType = DeductionType = {}));
class ConfigureStatutoryDeductionDto {
    type;
    value;
}
exports.ConfigureStatutoryDeductionDto = ConfigureStatutoryDeductionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type: "percentage" (e.g., 4.5) or "fixed_amount" (e.g., 1350)',
        enum: DeductionType,
        example: 'percentage',
    }),
    (0, class_validator_1.IsEnum)(DeductionType),
    __metadata("design:type", String)
], ConfigureStatutoryDeductionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Value: If percentage, enter as decimal (4.5 = 4.5%). If fixed_amount, enter in currency units',
        example: 4.5,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConfigureStatutoryDeductionDto.prototype, "value", void 0);
class ConfigureBenefitDefaultsDto {
    sss;
    philhealth;
    pagibig;
    notes;
}
exports.ConfigureBenefitDefaultsDto = ConfigureBenefitDefaultsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SSS (Social Security System) - set as percentage or fixed cap',
        type: ConfigureStatutoryDeductionDto,
        example: { type: 'percentage', value: 4.5 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ConfigureStatutoryDeductionDto)
], ConfigureBenefitDefaultsDto.prototype, "sss", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'PhilHealth (Philippine Health Insurance) - set as percentage or fixed cap',
        type: ConfigureStatutoryDeductionDto,
        example: { type: 'fixed_amount', value: 1750 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ConfigureStatutoryDeductionDto)
], ConfigureBenefitDefaultsDto.prototype, "philhealth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'PAG-IBIG (Home Development Mutual Fund) - set as percentage or fixed cap',
        type: ConfigureStatutoryDeductionDto,
        example: { type: 'percentage', value: 2 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ConfigureStatutoryDeductionDto)
], ConfigureBenefitDefaultsDto.prototype, "pagibig", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notes or description for this benefit configuration',
        example: 'Updated statutory deductions for 2026',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigureBenefitDefaultsDto.prototype, "notes", void 0);
//# sourceMappingURL=configure-benefit-defaults.dto.js.map