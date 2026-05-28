export declare enum ItemStatusEnum {
    PENDING = "pending",
    SUBMITTED = "submitted",
    FOR_REVIEW = "for-review",
    APPROVED = "approved",
    REJECTED = "rejected",
    ISSUED = "issued",
    CONFIRMED = "confirmed"
}
export declare class UpdateTaskStatusDto {
    remarks?: string;
    status: ItemStatusEnum;
    tab_tag?: string;
}
