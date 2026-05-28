export declare class ChecklistTemplateItemDto {
    item_name: string;
    description?: string;
    is_required: boolean;
    category?: 'Asset' | 'Document' | 'Task';
    is_custom?: boolean;
}
export declare class ConfigureChecklistTemplateDto {
    template_name: string;
    employee_type?: string;
    description?: string;
    applicable_offboarding_types?: Array<'Resignation' | 'Termination' | 'End of Contract'>;
    is_default?: boolean;
    require_knowledge_transfer?: boolean;
    system_access_to_revoke?: string[];
    items: ChecklistTemplateItemDto[];
}
