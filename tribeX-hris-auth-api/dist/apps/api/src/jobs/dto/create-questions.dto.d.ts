export declare class ApplicationQuestionDto {
    question_text: string;
    question_type: string;
    options?: any;
    is_required?: boolean;
    sort_order?: number;
}
export declare class SetQuestionsDto {
    questions: ApplicationQuestionDto[];
}
