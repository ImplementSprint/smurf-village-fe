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
exports.FileOvertimeRequestDto = exports.OvertimeType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var OvertimeType;
(function (OvertimeType) {
    OvertimeType["NORMAL"] = "NORMAL";
    OvertimeType["REST_DAY"] = "REST_DAY";
    OvertimeType["HOLIDAY"] = "HOLIDAY";
})(OvertimeType || (exports.OvertimeType = OvertimeType = {}));
class FileOvertimeRequestDto {
    ot_type;
    ot_date;
    start_time;
    end_time;
    latitude;
    longitude;
    reason;
}
exports.FileOvertimeRequestDto = FileOvertimeRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: OvertimeType }),
    (0, class_validator_1.IsEnum)(OvertimeType),
    __metadata("design:type", String)
], FileOvertimeRequestDto.prototype, "ot_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20' }),
    (0, class_validator_1.IsDateString)({ strict: true }, { message: 'ot_date must be YYYY-MM-DD' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FileOvertimeRequestDto.prototype, "ot_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '18:00' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'start_time must be HH:MM (24-hour)' }),
    __metadata("design:type", String)
], FileOvertimeRequestDto.prototype, "start_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '21:00' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'end_time must be HH:MM (24-hour)' }),
    __metadata("design:type", String)
], FileOvertimeRequestDto.prototype, "end_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], FileOvertimeRequestDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], FileOvertimeRequestDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], FileOvertimeRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=file-overtime-request.dto.js.map