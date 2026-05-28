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
exports.CreateBenefitDto = void 0;
const class_validator_1 = require("class-validator");
class CreateBenefitDto {
    benefit_name;
    benefit_type;
    taxable;
    default_amount;
}
exports.CreateBenefitDto = CreateBenefitDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'benefit_name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'benefit_name is required' }),
    (0, class_validator_1.MinLength)(1, { message: 'benefit_name must not be empty' }),
    (0, class_validator_1.MaxLength)(100, { message: 'benefit_name must not exceed 100 characters' }),
    __metadata("design:type", String)
], CreateBenefitDto.prototype, "benefit_name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'benefit_type must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'benefit_type is required' }),
    (0, class_validator_1.MinLength)(1, { message: 'benefit_type must not be empty' }),
    (0, class_validator_1.MaxLength)(50, { message: 'benefit_type must not exceed 50 characters' }),
    __metadata("design:type", String)
], CreateBenefitDto.prototype, "benefit_type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'taxable must be a boolean' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'taxable is required' }),
    __metadata("design:type", Boolean)
], CreateBenefitDto.prototype, "taxable", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'default_amount must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'default_amount must be greater than or equal to 0' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'default_amount is required' }),
    __metadata("design:type", Number)
], CreateBenefitDto.prototype, "default_amount", void 0);
//# sourceMappingURL=create-benefit.dto.js.map