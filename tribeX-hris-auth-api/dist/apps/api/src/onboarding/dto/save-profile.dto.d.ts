export declare class EmergencyContactDto {
    contact_name: string;
    relationship: string;
    emergency_phone_number: string;
    emergency_email_address?: string;
}
export declare class SaveProfileDto {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email_address: string;
    phone_number: string;
    complete_address?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    nationality?: string;
    civil_status?: string;
    emergency_contacts: EmergencyContactDto[];
    contact_name?: string;
    relationship?: string;
    emergency_phone_number?: string;
    emergency_email_address?: string;
}
