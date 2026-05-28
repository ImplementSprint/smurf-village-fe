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
exports.UpdateApplicationStatusDto = exports.VALID_APPLICATION_STATUSES = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
exports.VALID_APPLICATION_STATUSES = [
    'submitted',
    'screening',
    'first_interview',
    'technical_interview',
    'final_interview',
    'hired',
    'rejected',
    'withdrawn',
];
class UpdateApplicationStatusDto {
    status;
    rejection_reason;
    offer_deadline_days;
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status for the application',
        example: 'screening',
        enum: exports.VALID_APPLICATION_STATUSES,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(exports.VALID_APPLICATION_STATUSES),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for rejection (required when status is rejected)',
        example: 'Skills Mismatch',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "rejection_reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Days until offer acceptance deadline (only used when status is "hired", default 7)',
        example: 7,
        minimum: 1,
        maximum: 90,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateApplicationStatusDto.prototype, "offer_deadline_days", void 0);
//# sourceMappingURL=update-application-status.dto.js.map