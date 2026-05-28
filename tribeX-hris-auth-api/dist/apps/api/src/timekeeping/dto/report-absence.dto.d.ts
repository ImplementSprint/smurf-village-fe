export declare enum AbsenceReason {
    SICK = "Sick Leave",
    EMERGENCY = "Emergency Leave",
    WFH = "WFH / Remote",
    PERSONAL = "Personal Leave",
    VACATION = "Vacation Leave",
    APPROVED = "On Leave (Approved)",
    OTHER = "Other"
}
export declare class ReportAbsenceDto {
    reason: AbsenceReason;
    latitude: number;
    longitude: number;
    date_from?: string;
    date_to?: string;
    notes?: string;
}
