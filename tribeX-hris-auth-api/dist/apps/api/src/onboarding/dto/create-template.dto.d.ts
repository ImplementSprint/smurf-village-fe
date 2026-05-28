export declare class TemplateItemDto {
    type: string;
    tab_category: string;
    title: string;
    description?: string;
    rich_content?: string;
    is_required: boolean;
}
export declare class CreateTemplateDto {
    name: string;
    department_id: string;
    position_id: string;
    default_deadline_days: number;
    items: TemplateItemDto[];
}
