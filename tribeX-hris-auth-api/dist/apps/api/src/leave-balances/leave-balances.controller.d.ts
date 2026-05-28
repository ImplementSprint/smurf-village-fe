import { LeaveBalancesService } from './leave-balances.service';
import { UpsertEmployeeLeaveBalancesDto } from './dto/upsert-employee-leave-balances.dto';
import { CompanyDefaultLeaveBalancesDto } from './dto/company-default-leave-balances.dto';
import { BulkLeaveBalanceDto } from './dto/bulk-leave-balance.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class LeaveBalancesController {
    private readonly leaveBalancesService;
    constructor(leaveBalancesService: LeaveBalancesService);
    getMyBalances(req: AuthenticatedRequest): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    } | {
        categories: never[];
    }>;
    getCompanyDefaults(req: AuthenticatedRequest): Promise<any[]>;
    upsertCompanyDefaults(req: AuthenticatedRequest, dto: CompanyDefaultLeaveBalancesDto): Promise<any[]>;
    getDepartmentDefaults(departmentId: string, req: AuthenticatedRequest): Promise<{
        company_id: string;
        department_id: string;
        leave_category: import("./leave-categories").LeaveCategory;
        default_days: number;
    }[]>;
    upsertDepartmentDefaults(departmentId: string, req: AuthenticatedRequest, dto: CompanyDefaultLeaveBalancesDto): Promise<{
        company_id: string;
        department_id: string;
        leave_category: import("./leave-categories").LeaveCategory;
        default_days: number;
    }[]>;
    backfillCompanyDefaults(req: AuthenticatedRequest): Promise<{
        backfilled: number;
    }>;
    reconcileCompanyBalances(req: AuthenticatedRequest): Promise<{
        employees: number;
        categories_upserted: number;
    }>;
    getRoster(req: AuthenticatedRequest): Promise<{
        employee_id: string;
        user_id: string;
        first_name: any;
        last_name: any;
        department_id: string | null;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: any;
        }[];
    }[]>;
    getEmployeeBalances(userId: string, req: AuthenticatedRequest): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    upsertEmployeeBalances(userId: string, req: AuthenticatedRequest, dto: UpsertEmployeeLeaveBalancesDto): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    resetToDepartment(userId: string, req: AuthenticatedRequest): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    resetToCompanyDefault(userId: string, req: AuthenticatedRequest): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: import("./leave-categories").LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    bulkAssign(req: AuthenticatedRequest, dto: BulkLeaveBalanceDto): Promise<{
        assigned: number;
    }>;
}
