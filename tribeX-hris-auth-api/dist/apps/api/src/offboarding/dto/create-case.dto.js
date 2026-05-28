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
exports.CreateOffboardingCaseDto = exports.TerminationDetailsDto = exports.ResignationDetailsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_2 = require("class-validator");
class ResignationDetailsDto {
    reason;
    resignation_letter;
    document_url;
    document_name;
}
exports.ResignationDetailsDto = ResignationDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResignationDetailsDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ResignationDetailsDto.prototype, "resignation_letter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL of the uploaded resignation document (required)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResignationDetailsDto.prototype, "document_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filename of the uploaded resignation document (required)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResignationDetailsDto.prototype, "document_name", void 0);
class TerminationDetailsDto {
    reason;
    termination_details;
    document_url;
    document_name;
}
exports.TerminationDetailsDto = TerminationDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TerminationDetailsDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TerminationDetailsDto.prototype, "termination_details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TerminationDetailsDto.prototype, "document_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TerminationDetailsDto.prototype, "document_name", void 0);
class CreateOffboardingCaseDto {
    employee_id;
    offboarding_type;
    last_working_day;
    template_id;
    resignation;
    termination;
}
exports.CreateOffboardingCaseDto = CreateOffboardingCaseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOffboardingCaseDto.prototype, "employee_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Resignation', 'Termination', 'End of Contract'] }),
    (0, class_validator_1.IsIn)(['Resignation', 'Termination', 'End of Contract']),
    __metadata("design:type", String)
], CreateOffboardingCaseDto.prototype, "offboarding_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOffboardingCaseDto.prototype, "last_working_day", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Optional checklist template to apply for this case once HR accepts it' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOffboardingCaseDto.prototype, "template_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_2.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ResignationDetailsDto),
    __metadata("design:type", ResignationDetailsDto)
], CreateOffboardingCaseDto.prototype, "resignation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_2.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TerminationDetailsDto),
    __metadata("design:type", TerminationDetailsDto)
], CreateOffboardingCaseDto.prototype, "termination", void 0);
//# sourceMappingURL=create-case.dto.js.map