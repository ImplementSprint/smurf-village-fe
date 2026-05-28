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
exports.CompanyDefaultScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CompanyDefaultScheduleDto {
    start_time;
    end_time;
    break_start;
    break_end;
    workdays;
    is_nightshift;
    effective_date;
}
exports.CompanyDefaultScheduleDto = CompanyDefaultScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shift start time in HH:MM format', example: '09:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'start_time must be in HH:MM format' }),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shift end time in HH:MM format', example: '18:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'end_time must be in HH:MM format' }),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "end_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Break start time in HH:MM format', example: '12:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'break_start must be in HH:MM format' }),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "break_start", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Break end time in HH:MM format', example: '13:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}$/, { message: 'break_end must be in HH:MM format' }),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "break_end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Comma-separated workday codes',
        example: 'MON,TUE,WED,THU,FRI',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "workdays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a night shift', example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CompanyDefaultScheduleDto.prototype, "is_nightshift", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default schedule effectivity date in YYYY-MM-DD format',
        example: '2026-04-27',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'effective_date must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], CompanyDefaultScheduleDto.prototype, "effective_date", void 0);
//# sourceMappingURL=company-default-schedule.dto.js.map