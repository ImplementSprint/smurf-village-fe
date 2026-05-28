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
exports.RunPayrollCutoffDto = void 0;
const class_validator_1 = require("class-validator");
class RunPayrollCutoffDto {
    cutoff_date;
}
exports.RunPayrollCutoffDto = RunPayrollCutoffDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'cutoff_date must be a string' }),
    (0, class_validator_1.IsDateString)({}, { message: 'cutoff_date must be a valid ISO 8601 date (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'cutoff_date is required' }),
    __metadata("design:type", String)
], RunPayrollCutoffDto.prototype, "cutoff_date", void 0);
//# sourceMappingURL=run-payroll-cutoff.dto.js.map