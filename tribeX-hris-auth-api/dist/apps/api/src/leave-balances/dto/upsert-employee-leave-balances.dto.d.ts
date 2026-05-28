import { LeaveCategory } from '../leave-categories';
export declare class LeaveBalanceItemDto {
    leave_category: LeaveCategory;
    entitled_days: number;
}
export declare class UpsertEmployeeLeaveBalancesDto {
    items: LeaveBalanceItemDto[];
}
