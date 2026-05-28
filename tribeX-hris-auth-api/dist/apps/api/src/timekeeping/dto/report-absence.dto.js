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
exports.ReportAbsenceDto = exports.AbsenceReason = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var AbsenceReason;
(function (AbsenceReason) {
    AbsenceReason["SICK"] = "Sick Leave";
    AbsenceReason["EMERGENCY"] = "Emergency Leave";
    AbsenceReason["WFH"] = "WFH / Remote";
    AbsenceReason["PERSONAL"] = "Personal Leave";
    AbsenceReason["VACATION"] = "Vacation Leave";
    AbsenceReason["APPROVED"] = "On Leave (Approved)";
    AbsenceReason["OTHER"] = "Other";
})(AbsenceReason || (exports.AbsenceReason = AbsenceReason = {}));
class ReportAbsenceDto {
    reason;
    latitude;
    longitude;
    date_from;
    date_to;
    notes;
}
exports.ReportAbsenceDto = ReportAbsenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: AbsenceReason, description: 'Reason for absence' }),
    (0, class_validator_1.IsEnum)(AbsenceReason),
    __metadata("design:type", String)
], ReportAbsenceDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GPS latitude coordinate (required)',
        example: 14.5995,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], ReportAbsenceDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GPS longitude coordinate (required)',
        example: 120.9842,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], ReportAbsenceDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Absence start date in YYYY-MM-DD format. Defaults to today in Manila.',
        example: '2026-04-26',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportAbsenceDto.prototype, "date_from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Absence end date in YYYY-MM-DD format. Defaults to date_from.',
        example: '2026-04-28',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportAbsenceDto.prototype, "date_to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional additional notes', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ReportAbsenceDto.prototype, "notes", void 0);
//# sourceMappingURL=report-absence.dto.js.map