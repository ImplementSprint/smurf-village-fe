import { LeaveCategory } from '../leave-categories';
export declare class BulkLeaveItemDto {
    leave_category: LeaveCategory;
    entitled_days: number;
}
export declare class BulkLeaveBalanceDto {
    scope: 'company' | 'department' | 'employees';
    department_id?: string;
    user_ids?: string[];
    items: BulkLeaveItemDto[];
}
