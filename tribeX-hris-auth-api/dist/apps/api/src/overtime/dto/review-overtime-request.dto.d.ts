export declare enum OvertimeReviewAction {
    APPROVE = "approve",
    DENY = "deny"
}
export declare class ReviewOvertimeRequestDto {
    action: OvertimeReviewAction;
    review_reason?: string;
}
