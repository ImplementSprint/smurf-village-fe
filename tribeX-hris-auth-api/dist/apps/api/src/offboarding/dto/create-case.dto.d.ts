export declare class ResignationDetailsDto {
    reason: string;
    resignation_letter?: string;
    document_url: string;
    document_name: string;
}
export declare class TerminationDetailsDto {
    reason: string;
    termination_details?: string;
    document_url?: string;
    document_name?: string;
}
export declare class CreateOffboardingCaseDto {
    employee_id: string;
    offboarding_type: string;
    last_working_day: string;
    template_id?: string;
    resignation?: ResignationDetailsDto;
    termination?: TerminationDetailsDto;
}
