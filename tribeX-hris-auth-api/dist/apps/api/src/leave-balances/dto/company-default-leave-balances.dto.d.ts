import { LeaveCategory } from '../leave-categories';
export declare class CompanyDefaultItemDto {
    leave_category: LeaveCategory;
    default_days: number;
}
export declare class CompanyDefaultLeaveBalancesDto {
    items: CompanyDefaultItemDto[];
}
