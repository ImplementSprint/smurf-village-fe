export declare class InterviewResponseDto {
    action: 'accepted' | 'declined' | 'reschedule_requested';
    note: string;
    stage?: string | null;
}
