export declare const LEAVE_TYPES: readonly ["Vacation Leave", "Sick Leave", "Emergency Leave", "Personal Leave", "WFH / Remote", "Other"];
export declare const RETRO_ELIGIBLE_LEAVE_TYPES: string[];
export type LeaveType = (typeof LEAVE_TYPES)[number];
export declare class FileLeaveRequestDto {
    leave_type: LeaveType;
    start_date: string;
    end_date: string;
    reason?: string;
    attachment_url?: string;
    is_retro?: boolean;
    retro_reason?: string;
}
