export declare class ApplicationAnswerDto {
    question_id: string;
    answer_value?: string;
}
export declare class CreateApplicationDto {
    answers?: ApplicationAnswerDto[];
    resume_storage_path?: string;
    resume_file_name?: string;
}
