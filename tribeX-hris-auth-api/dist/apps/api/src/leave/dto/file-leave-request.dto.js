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
exports.FileLeaveRequestDto = exports.RETRO_ELIGIBLE_LEAVE_TYPES = exports.LEAVE_TYPES = void 0;
const class_validator_1 = require("class-validator");
exports.LEAVE_TYPES = [
    'Vacation Leave',
    'Sick Leave',
    'Emergency Leave',
    'Personal Leave',
    'WFH / Remote',
    'Other',
];
exports.RETRO_ELIGIBLE_LEAVE_TYPES = ['Sick Leave', 'Emergency Leave'];
class FileLeaveRequestDto {
    leave_type;
    start_date;
    end_date;
    reason;
    attachment_url;
    is_retro;
    retro_reason;
}
exports.FileLeaveRequestDto = FileLeaveRequestDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'leave_type must be a string' }),
    (0, class_validator_1.IsIn)([...exports.LEAVE_TYPES], {
        message: `leave_type must be one of: ${exports.LEAVE_TYPES.join(', ')}`,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'leave_type is required' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "leave_type", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true }, { message: 'start_date must be in ISO 8601 format (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'start_date is required' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({ strict: true }, { message: 'end_date must be in ISO 8601 format (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'end_date is required' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "end_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'reason must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'attachment_url must be a string' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "attachment_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'is_retro must be a boolean' }),
    __metadata("design:type", Boolean)
], FileLeaveRequestDto.prototype, "is_retro", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.is_retro === true),
    (0, class_validator_1.IsString)({ message: 'retro_reason must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'retro_reason is required when filing a retro leave request' }),
    (0, class_validator_1.MaxLength)(500, { message: 'retro_reason must not exceed 500 characters' }),
    __metadata("design:type", String)
], FileLeaveRequestDto.prototype, "retro_reason", void 0);
//# sourceMappingURL=file-leave-request.dto.js.map