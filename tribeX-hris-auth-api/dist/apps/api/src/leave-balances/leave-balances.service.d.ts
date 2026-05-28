import { SupabaseService } from '@app/supabase';
import { LeaveCategory } from './leave-categories';
import { UpsertEmployeeLeaveBalancesDto } from './dto/upsert-employee-leave-balances.dto';
import { CompanyDefaultLeaveBalancesDto } from './dto/company-default-leave-balances.dto';
import { BulkLeaveBalanceDto } from './dto/bulk-leave-balance.dto';
export declare class LeaveBalancesService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    private get db();
    private resolveEmployeeId;
    private resolveCompanyForEmployee;
    private getUpdaterName;
    private getEmployeesForCompany;
    private get currentYear();
    private getUserIdByEmployeeId;
    private getTimeBalancesByUser;
    private upsertTimeBalanceAllocated;
    private getEmployeeDepartmentId;
    private getDepartmentDefaultsMap;
    getCompanyDefaults(companyId: string): Promise<any[]>;
    upsertCompanyDefaults(companyId: string, dto: CompanyDefaultLeaveBalancesDto, updaterUserId?: string): Promise<any[]>;
    getDepartmentDefaults(companyId: string, departmentId: string): Promise<{
        company_id: string;
        department_id: string;
        leave_category: LeaveCategory;
        default_days: number;
    }[]>;
    upsertDepartmentDefaults(companyId: string, departmentId: string, dto: CompanyDefaultLeaveBalancesDto, updaterUserId?: string): Promise<{
        company_id: string;
        department_id: string;
        leave_category: LeaveCategory;
        default_days: number;
    }[]>;
    private syncDepartmentSourcedEmployees;
    private syncDefaultSourcedEmployees;
    backfillCompanyDefaults(companyId: string, updaterUserId?: string): Promise<{
        backfilled: number;
    }>;
    reconcileCompanyBalances(companyId: string, updaterUserId?: string): Promise<{
        employees: number;
        categories_upserted: number;
    }>;
    getRoster(companyId: string): Promise<{
        employee_id: string;
        user_id: string;
        first_name: any;
        last_name: any;
        department_id: string | null;
        categories: {
            leave_category: LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: any;
        }[];
    }[]>;
    getEmployeeBalances(userId: string, companyId: string): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    getMyBalances(userId: string): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: LeaveCategory;
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
    upsertEmployeeBalances(userId: string, companyId: string, dto: UpsertEmployeeLeaveBalancesDto, updaterUserId?: string): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    resetToDepartment(userId: string, companyId: string, updaterUserId?: string): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    resetToCompanyDefault(userId: string, companyId: string, updaterUserId?: string): Promise<{
        employee_id: null;
        categories: never[];
    } | {
        employee_id: string;
        categories: {
            leave_category: LeaveCategory;
            entitled_days: number;
            used_days: number;
            remaining_days: number;
            balance_source: "default" | "bulk" | "individual";
            updated_by_name: string | null;
            updated_at: string | null;
        }[];
    }>;
    bulkAssign(companyId: string, dto: BulkLeaveBalanceDto, updaterUserId?: string): Promise<{
        assigned: number;
    }>;
    deductLeaveBalance(employeeId: string, companyId: string, leaveCategory: LeaveCategory, days: number): Promise<void>;
    assignInitialLeaveBalancesForEmployee(params: {
        companyId: string;
        employeeId: string;
        departmentId?: string | null;
        updatedByName?: string | null;
    }): Promise<{
        source: string;
    }>;
}
