import { UpsertScheduleDto } from './upsert-schedule.dto';
export declare class BulkScheduleDto {
    scope: 'company' | 'department' | 'employees';
    department_id?: string;
    user_ids?: string[];
    employee_ids?: string[];
    schedule: UpsertScheduleDto;
    effective_date?: string;
    skip_individual?: boolean;
}
