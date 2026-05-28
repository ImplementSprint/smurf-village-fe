export declare class CreateChangeRequestDto {
    field_type: 'legal_name' | 'bank';
    requested_changes: Record<string, string>;
    reason: string;
    supporting_doc_url?: string;
}
