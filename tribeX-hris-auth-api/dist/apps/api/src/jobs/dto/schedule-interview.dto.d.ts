export declare class ScheduleInterviewDto {
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    format: 'in_person' | 'video' | 'phone';
    location?: string | null;
    meeting_link?: string | null;
    interviewer_name: string;
    interviewer_title?: string | null;
    notes?: string | null;
    scheduled_by_email?: string | null;
    stage?: string | null;
}
