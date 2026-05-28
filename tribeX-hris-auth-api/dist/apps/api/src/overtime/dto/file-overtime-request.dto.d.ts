export declare enum OvertimeType {
    NORMAL = "NORMAL",
    REST_DAY = "REST_DAY",
    HOLIDAY = "HOLIDAY"
}
export declare class FileOvertimeRequestDto {
    ot_type: OvertimeType;
    ot_date: string;
    start_time: string;
    end_time: string;
    latitude: number;
    longitude: number;
    reason?: string;
}
