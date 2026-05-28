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
exports.InterviewResponseDto = void 0;
const class_validator_1 = require("class-validator");
class InterviewResponseDto {
    action;
    note;
    stage;
}
exports.InterviewResponseDto = InterviewResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['accepted', 'declined', 'reschedule_requested']),
    __metadata("design:type", String)
], InterviewResponseDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A reason is required.' }),
    __metadata("design:type", String)
], InterviewResponseDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['first_interview', 'technical_interview', 'final_interview']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], InterviewResponseDto.prototype, "stage", void 0);
//# sourceMappingURL=interview-response.dto.js.map