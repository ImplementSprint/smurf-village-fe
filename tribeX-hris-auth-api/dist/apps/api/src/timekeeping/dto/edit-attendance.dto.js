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
exports.EditAttendanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const CLOCK_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ATTENDANCE_STATUS_ACTIONS = ['clocked-in', 'present', 'excused', 'absent'];
class EditAttendanceDto {
    time_in;
    time_out;
    attendance_status;
    absence_reason;
    edit_reason;
}
exports.EditAttendanceDto = EditAttendanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Clock-in time in 24-hour HH:mm format.',
        example: '08:45',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(CLOCK_REGEX, { message: 'time_in must be in HH:mm format.' }),
    __metadata("design:type", String)
], EditAttendanceDto.prototype, "time_in", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Clock-out time in 24-hour HH:mm format.',
        example: '17:32',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(CLOCK_REGEX, { message: 'time_out must be in HH:mm format.' }),
    __metadata("design:type", String)
], EditAttendanceDto.prototype, "time_out", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional HR quick action for common attendance corrections.',
        enum: ATTENDANCE_STATUS_ACTIONS,
        example: 'excused',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ATTENDANCE_STATUS_ACTIONS),
    __metadata("design:type", Object)
], EditAttendanceDto.prototype, "attendance_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional absence/excuse reason for HR quick actions.',
        maxLength: 120,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], EditAttendanceDto.prototype, "absence_reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Required reason for the attendance correction.',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], EditAttendanceDto.prototype, "edit_reason", void 0);
//# sourceMappingURL=edit-attendance.dto.js.map