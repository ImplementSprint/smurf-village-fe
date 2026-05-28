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
exports.AssignBenefitDto = void 0;
const class_validator_1 = require("class-validator");
class AssignBenefitDto {
    user_id;
    benefit_id;
    amount;
    effective_date;
}
exports.AssignBenefitDto = AssignBenefitDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'user_id must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'user_id is required' }),
    __metadata("design:type", String)
], AssignBenefitDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'benefit_id must be a valid UUID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'benefit_id is required' }),
    __metadata("design:type", String)
], AssignBenefitDto.prototype, "benefit_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with at most 2 decimal places' }),
    (0, class_validator_1.Min)(0, { message: 'amount must be greater than or equal to 0' }),
    __metadata("design:type", Number)
], AssignBenefitDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true }, { message: 'effective_date must be in ISO 8601 format (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'effective_date is required' }),
    __metadata("design:type", String)
], AssignBenefitDto.prototype, "effective_date", void 0);
//# sourceMappingURL=assign-benefit.dto.js.map