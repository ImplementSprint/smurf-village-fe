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
exports.SetQuestionsDto = exports.ApplicationQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ApplicationQuestionDto {
    question_text;
    question_type;
    options;
    is_required;
    sort_order;
}
exports.ApplicationQuestionDto = ApplicationQuestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplicationQuestionDto.prototype, "question_text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplicationQuestionDto.prototype, "question_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ApplicationQuestionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApplicationQuestionDto.prototype, "is_required", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ApplicationQuestionDto.prototype, "sort_order", void 0);
class SetQuestionsDto {
    questions;
}
exports.SetQuestionsDto = SetQuestionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ApplicationQuestionDto),
    __metadata("design:type", Array)
], SetQuestionsDto.prototype, "questions", void 0);
//# sourceMappingURL=create-questions.dto.js.map