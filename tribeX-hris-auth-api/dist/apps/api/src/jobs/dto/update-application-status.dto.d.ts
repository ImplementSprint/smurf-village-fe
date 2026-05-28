export declare const VALID_APPLICATION_STATUSES: readonly ["submitted", "screening", "first_interview", "technical_interview", "final_interview", "hired", "rejected", "withdrawn"];
export type ApplicationStatus = typeof VALID_APPLICATION_STATUSES[number];
export declare class UpdateApplicationStatusDto {
    status: ApplicationStatus;
    rejection_reason?: string;
    offer_deadline_days?: number;
}
