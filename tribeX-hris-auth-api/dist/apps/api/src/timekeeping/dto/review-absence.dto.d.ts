export declare enum AbsenceReviewAction {
    APPROVE = "approve",
    DENY = "deny"
}
export declare class ReviewAbsenceDto {
    action: AbsenceReviewAction;
    review_reason: string;
}
