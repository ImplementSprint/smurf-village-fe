export declare class SaveOnboardingDto {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    nationality?: string;
    civil_status?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    preferred_username?: string;
    department_id?: string;
    start_date?: string;
}
export declare class RejectOnboardingDto {
    hr_notes: string;
}
export declare class ApproveOnboardingDto {
    role_id: string;
}
