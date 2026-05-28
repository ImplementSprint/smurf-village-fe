export declare class CreateJobPostingDto {
    title: string;
    description: string;
    location?: string;
    employment_type?: string;
    salary_range?: string;
    department_id?: string;
    closes_at?: string;
    status?: 'open' | 'draft';
}
