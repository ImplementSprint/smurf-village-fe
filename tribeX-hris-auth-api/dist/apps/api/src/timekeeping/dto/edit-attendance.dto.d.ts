declare const ATTENDANCE_STATUS_ACTIONS: readonly ["clocked-in", "present", "excused", "absent"];
export declare class EditAttendanceDto {
    time_in?: string;
    time_out?: string;
    attendance_status?: (typeof ATTENDANCE_STATUS_ACTIONS)[number];
    absence_reason?: string;
    edit_reason: string;
}
export {};
