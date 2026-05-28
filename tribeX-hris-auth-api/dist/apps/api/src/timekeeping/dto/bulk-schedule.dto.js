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
exports.BulkScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const upsert_schedule_dto_1 = require("./upsert-schedule.dto");
class BulkScheduleDto {
    scope;
    department_id;
    user_ids;
    employee_ids;
    schedule;
    effective_date;
    skip_individual;
}
exports.BulkScheduleDto = BulkScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['company', 'department', 'employees'],
        description: 'Scope of the bulk schedule assignment',
    }),
    (0, class_validator_1.IsEnum)(['company', 'department', 'employees']),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Department ID — required when scope is "department"',
        example: 'uuid-dept-id',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of user_ids — required when scope is "employees"',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkScheduleDto.prototype, "user_ids", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of employee_ids — fallback when user_ids are unavailable',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkScheduleDto.prototype, "employee_ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => upsert_schedule_dto_1.UpsertScheduleDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => upsert_schedule_dto_1.UpsertScheduleDto),
    __metadata("design:type", upsert_schedule_dto_1.UpsertScheduleDto)
], BulkScheduleDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Effective date in YYYY-MM-DD format',
        example: '2026-04-15',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'effective_date must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "effective_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When true, employees who already have an individually-assigned schedule will be skipped',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BulkScheduleDto.prototype, "skip_individual", void 0);
//# sourceMappingURL=bulk-schedule.dto.js.map