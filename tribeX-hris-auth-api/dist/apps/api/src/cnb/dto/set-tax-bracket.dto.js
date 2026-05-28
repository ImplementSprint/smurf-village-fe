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
exports.SetTaxBracketDto = void 0;
const class_validator_1 = require("class-validator");
class SetTaxBracketDto {
    effective_year;
    min_salary;
    max_salary;
    base_tax_amount;
    excess_percentage;
}
exports.SetTaxBracketDto = SetTaxBracketDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000, { message: 'effective_year must be 2000 or later' }),
    (0, class_validator_1.Max)(2099, { message: 'effective_year must be 2099 or earlier' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'effective_year is required' }),
    __metadata("design:type", Number)
], SetTaxBracketDto.prototype, "effective_year", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'min_salary must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'min_salary must be greater than or equal to 0' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'min_salary is required' }),
    __metadata("design:type", Number)
], SetTaxBracketDto.prototype, "min_salary", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'max_salary must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'max_salary must be greater than or equal to 0' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'max_salary is required' }),
    __metadata("design:type", Number)
], SetTaxBracketDto.prototype, "max_salary", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'base_tax_amount must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'base_tax_amount must be greater than or equal to 0' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'base_tax_amount is required' }),
    __metadata("design:type", Number)
], SetTaxBracketDto.prototype, "base_tax_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }, { message: 'excess_percentage must be a number with at most 4 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'excess_percentage must be greater than or equal to 0' }),
    (0, class_validator_1.Max)(100, { message: 'excess_percentage must be 100 or less (e.g. use 15 for 15%)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'excess_percentage is required' }),
    __metadata("design:type", Number)
], SetTaxBracketDto.prototype, "excess_percentage", void 0);
//# sourceMappingURL=set-tax-bracket.dto.js.map