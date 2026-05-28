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
exports.CreateSelfAssessmentDto = exports.RejectGoalDto = exports.GoalProgressDto = exports.PatchGoalDto = exports.PatchCycleDto = exports.CreateCycleDto = exports.CreateBonusRuleDto = exports.CreateViolationRuleDto = exports.CycleSettingsDto = exports.PatchViolationDto = exports.AddCommentDto = exports.ReviewItemDto = exports.ApproveItemDto = exports.ReviewPipUpdateDto = exports.PipUpdateDto = exports.CreatePipDto = exports.CreateViolationDto = exports.CreateEvaluationDto = exports.EvaluationRecommendationsDto = exports.CreateEvaluationGoalResultDto = exports.CreateGoalDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateGoalDto {
    user_id;
    title;
    category;
    kpi;
    target;
    deadline;
    priority;
}
exports.CreateGoalDto = CreateGoalDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "kpi", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "priority", void 0);
class CreateEvaluationGoalResultDto {
    perf_goals_id;
    completed;
}
exports.CreateEvaluationGoalResultDto = CreateEvaluationGoalResultDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEvaluationGoalResultDto.prototype, "perf_goals_id", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEvaluationGoalResultDto.prototype, "completed", void 0);
class EvaluationRecommendationsDto {
    promotion;
    bonus;
    merit;
}
exports.EvaluationRecommendationsDto = EvaluationRecommendationsDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EvaluationRecommendationsDto.prototype, "promotion", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EvaluationRecommendationsDto.prototype, "bonus", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EvaluationRecommendationsDto.prototype, "merit", void 0);
class CreateEvaluationDto {
    user_id;
    review_period;
    scale_rating;
    rating_status;
    perf_comments;
    goal_results;
    recommendations;
}
exports.CreateEvaluationDto = CreateEvaluationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "review_period", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEvaluationDto.prototype, "scale_rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "rating_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "perf_comments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateEvaluationGoalResultDto),
    __metadata("design:type", Array)
], CreateEvaluationDto.prototype, "goal_results", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EvaluationRecommendationsDto),
    __metadata("design:type", EvaluationRecommendationsDto)
], CreateEvaluationDto.prototype, "recommendations", void 0);
class CreateViolationDto {
    user_id;
    violation_type;
    severity;
    description;
    evidence;
    occured_at;
}
exports.CreateViolationDto = CreateViolationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "violation_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "evidence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationDto.prototype, "occured_at", void 0);
class CreatePipDto {
    user_id;
    perf_eval_id;
    deadline;
    pip_goals;
}
exports.CreatePipDto = CreatePipDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePipDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePipDto.prototype, "perf_eval_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePipDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePipDto.prototype, "pip_goals", void 0);
class PipUpdateDto {
    progress_data;
    progress_summary;
    milestone_label;
}
exports.PipUpdateDto = PipUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], PipUpdateDto.prototype, "progress_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PipUpdateDto.prototype, "progress_summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PipUpdateDto.prototype, "milestone_label", void 0);
class ReviewPipUpdateDto {
    manager_notes;
}
exports.ReviewPipUpdateDto = ReviewPipUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewPipUpdateDto.prototype, "manager_notes", void 0);
class ApproveItemDto {
    type;
    document_url;
}
exports.ApproveItemDto = ApproveItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveItemDto.prototype, "document_url", void 0);
class ReviewItemDto {
    type;
    action;
    comment;
}
exports.ReviewItemDto = ReviewItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewItemDto.prototype, "comment", void 0);
class AddCommentDto {
    comment_text;
}
exports.AddCommentDto = AddCommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCommentDto.prototype, "comment_text", void 0);
class PatchViolationDto {
    action_status;
    disciplinary_action;
}
exports.PatchViolationDto = PatchViolationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchViolationDto.prototype, "action_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchViolationDto.prototype, "disciplinary_action", void 0);
class CycleSettingsDto {
    settings;
    violation_rules;
    bonus_rules;
}
exports.CycleSettingsDto = CycleSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CycleSettingsDto.prototype, "settings", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CycleSettingsDto.prototype, "violation_rules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CycleSettingsDto.prototype, "bonus_rules", void 0);
class CreateViolationRuleDto {
    violation_count;
    severity_threshold;
    resulting_action;
    affects_bonus;
    affects_merit;
    affects_perks;
    rule_description;
    within_days;
    suspension_days;
    condition;
    action;
    affectedBenefits;
}
exports.CreateViolationRuleDto = CreateViolationRuleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateViolationRuleDto.prototype, "violation_count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "severity_threshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "resulting_action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateViolationRuleDto.prototype, "affects_bonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateViolationRuleDto.prototype, "affects_merit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateViolationRuleDto.prototype, "affects_perks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "rule_description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateViolationRuleDto.prototype, "within_days", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateViolationRuleDto.prototype, "suspension_days", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateViolationRuleDto.prototype, "affectedBenefits", void 0);
class CreateBonusRuleDto {
    rating_min;
    rating_max;
    bonus_pct;
    merit_increase_pct;
    promotion_eligible;
    rating_label;
    amount_type;
    bonus_fixed_amount;
    merit_fixed_amount;
}
exports.CreateBonusRuleDto = CreateBonusRuleDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "rating_min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "rating_max", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "bonus_pct", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "merit_increase_pct", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBonusRuleDto.prototype, "promotion_eligible", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonusRuleDto.prototype, "rating_label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBonusRuleDto.prototype, "amount_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "bonus_fixed_amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBonusRuleDto.prototype, "merit_fixed_amount", void 0);
class CreateCycleDto {
    cycle_name;
    start_date;
    end_date;
    status;
}
exports.CreateCycleDto = CreateCycleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCycleDto.prototype, "cycle_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCycleDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCycleDto.prototype, "end_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCycleDto.prototype, "status", void 0);
class PatchCycleDto {
    status;
    cycle_name;
    start_date;
    end_date;
}
exports.PatchCycleDto = PatchCycleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchCycleDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchCycleDto.prototype, "cycle_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchCycleDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchCycleDto.prototype, "end_date", void 0);
class PatchGoalDto {
    title;
    category;
    kpi;
    target;
    deadline;
    progress_pct;
    status;
}
exports.PatchGoalDto = PatchGoalDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "kpi", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "target", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PatchGoalDto.prototype, "progress_pct", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatchGoalDto.prototype, "status", void 0);
class GoalProgressDto {
    progress_pct;
    notes;
    progress_value;
    checkpoint_type;
}
exports.GoalProgressDto = GoalProgressDto;
__decorate([
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GoalProgressDto.prototype, "progress_pct", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoalProgressDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoalProgressDto.prototype, "progress_value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoalProgressDto.prototype, "checkpoint_type", void 0);
class RejectGoalDto {
    reason;
}
exports.RejectGoalDto = RejectGoalDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectGoalDto.prototype, "reason", void 0);
class CreateSelfAssessmentDto {
    goal_results;
    self_comments;
}
exports.CreateSelfAssessmentDto = CreateSelfAssessmentDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateSelfAssessmentDto.prototype, "goal_results", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSelfAssessmentDto.prototype, "self_comments", void 0);
//# sourceMappingURL=performance.dto.js.map