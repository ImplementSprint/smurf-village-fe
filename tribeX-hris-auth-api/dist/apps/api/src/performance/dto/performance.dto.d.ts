export declare class CreateGoalDto {
    user_id?: string;
    title: string;
    category: string;
    kpi: string;
    target: string;
    deadline?: string;
    priority?: string;
}
export declare class CreateEvaluationGoalResultDto {
    perf_goals_id: string;
    completed: boolean;
}
export declare class EvaluationRecommendationsDto {
    promotion: boolean;
    bonus: boolean;
    merit: boolean;
}
export declare class CreateEvaluationDto {
    user_id: string;
    review_period: string;
    scale_rating: number;
    rating_status: string;
    perf_comments?: string;
    goal_results?: CreateEvaluationGoalResultDto[];
    recommendations?: EvaluationRecommendationsDto;
}
export declare class CreateViolationDto {
    user_id: string;
    violation_type: string;
    severity: string;
    description: string;
    evidence?: string;
    occured_at?: string;
}
export declare class CreatePipDto {
    user_id: string;
    perf_eval_id?: string;
    deadline?: string;
    pip_goals?: any[];
}
export declare class PipUpdateDto {
    progress_data?: any[];
    progress_summary?: string;
    milestone_label?: string;
}
export declare class ReviewPipUpdateDto {
    manager_notes?: string;
}
export declare class ApproveItemDto {
    type: string;
    document_url?: string;
}
export declare class ReviewItemDto {
    type: string;
    action: string;
    comment?: string;
}
export declare class AddCommentDto {
    comment_text: string;
}
export declare class PatchViolationDto {
    action_status?: string;
    disciplinary_action?: string;
}
export declare class CycleSettingsDto {
    settings?: any;
    violation_rules?: any[];
    bonus_rules?: any[];
}
export declare class CreateViolationRuleDto {
    violation_count?: number;
    severity_threshold?: string;
    resulting_action?: string;
    affects_bonus?: boolean;
    affects_merit?: boolean;
    affects_perks?: boolean;
    rule_description?: string;
    within_days?: number;
    suspension_days?: number;
    condition?: string;
    action?: string;
    affectedBenefits?: string;
}
export declare class CreateBonusRuleDto {
    rating_min: number;
    rating_max: number;
    bonus_pct: number;
    merit_increase_pct: number;
    promotion_eligible: boolean;
    rating_label?: string;
    amount_type?: string;
    bonus_fixed_amount?: number;
    merit_fixed_amount?: number;
}
export declare class CreateCycleDto {
    cycle_name: string;
    start_date: string;
    end_date: string;
    status?: string;
}
export declare class PatchCycleDto {
    status?: string;
    cycle_name?: string;
    start_date?: string;
    end_date?: string;
}
export declare class PatchGoalDto {
    title?: string;
    category?: string;
    kpi?: string;
    target?: string;
    deadline?: string;
    progress_pct?: number;
    status?: string;
}
export declare class GoalProgressDto {
    progress_pct: number;
    notes?: string;
    progress_value?: string;
    checkpoint_type?: string;
}
export declare class RejectGoalDto {
    reason?: string;
}
export declare class CreateSelfAssessmentDto {
    goal_results: any[];
    self_comments?: string;
}
