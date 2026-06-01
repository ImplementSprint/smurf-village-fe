export interface JobFormState {
  title: string;
  description: string;
  location: string;
  employment_type: string;
  salary_range: string;
  closes_at: string;
  department_id: string;
}

export interface DepartmentOption {
  department_id: string;
  department_name: string;
}

export interface JobQuestion {
  id: string;
  question_text: string;
  question_type: "text" | "multiple_choice" | "checkbox";
  options: string[];
  is_required: boolean;
}
