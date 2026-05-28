import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@app/supabase';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TimekeepingService } from '../timekeeping/timekeeping.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
declare const PERMISSION_COLUMNS: {
    readonly read: "can_read";
    readonly create: "can_create";
    readonly update: "can_update";
    readonly delete: "can_delete";
};
type PermissionKey = keyof typeof PERMISSION_COLUMNS;
type PermissionSet = Record<PermissionKey, boolean>;
export declare class UsersService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly config;
    private readonly auditService;
    private readonly notificationsService;
    private readonly timekeepingService;
    private readonly logger;
    private readonly VALID_MODULES;
    constructor(supabaseService: SupabaseService, mailService: MailService, config: ConfigService, auditService: AuditService, notificationsService: NotificationsService, timekeepingService: TimekeepingService);
    private syncUserPortalAssignments;
    private buildEmptyPermissionSet;
    private compareRoleNames;
    private parseModuleRoleEntry;
    private normalizeLifecycleModules;
    private validateDepartmentBelongsToCompany;
    private validateRoleBelongsToCompany;
    private normalizeOptionalString;
    private isMissingDatabaseObject;
    private throwInsertUserError;
    private collectModuleRows;
    private mapRoleIdsByRoleName;
    private mapFeatureIdsByModule;
    getLifecyclePermissions(companyId: string): Promise<{
        module_id: string;
        name: string;
        description: string;
        icon: string;
        roles: {
            role_name: string;
            permissions: PermissionSet;
        }[];
    }[]>;
    saveLifecyclePermissions(modules: unknown[], companyId: string, adminUserId: string): Promise<{
        module_id: string;
        name: string;
        description: string;
        icon: string;
        roles: {
            role_name: string;
            permissions: PermissionSet;
        }[];
    }[]>;
    getTenantConfig(companyId: string): Promise<any>;
    updateTenantConfig(companyId: string, updates: {
        timezone?: string;
        date_format?: string;
        currency?: string;
        org_structure?: any;
        payroll_settings?: {
            working_days_per_year?: number;
            overtime_multiplier?: number;
            late_deduction_per_hour?: number;
            night_shift_diff_multiplier?: number;
        };
        branding_settings?: {
            company_display_name?: string | null;
            company_logo_url?: string | null;
        };
    }, adminUserId: string): Promise<any>;
    getTenantModules(companyId: string): Promise<{
        id: any;
        company_id: any;
        module: any;
        status: any;
    }[] | {
        company_id: string;
        module: "onboarding" | "recruitment" | "compensation" | "performance" | "offboarding";
        status: string;
    }[]>;
    updateTenantModule(companyId: string, module: string, status: 'Active' | 'Inactive', adminUserId: string): Promise<any>;
    getMyAccessibleModules(roleId: string, companyId: string): Promise<{
        module_id: string;
        name: string;
        can_read: boolean;
        can_create: boolean;
        can_update: boolean;
        can_delete: boolean;
    }[]>;
    getCompanies(companyId?: string): Promise<{
        company_id: any;
        company_name: any;
    }[]>;
    getCompanyInfo(companyId: string): Promise<{
        company_display_name: string | null;
        company_logo_url: string | null;
        company_id: any;
        company_name: any;
        slug: any;
    }>;
    private getNextEmployeeNumber;
    private getInviteExpiryMap;
    private getLastLoginMap;
    private inheritDepartmentScheduleForEmployee;
    getRoles(companyId: string): Promise<{
        role_id: any;
        role_name: any;
    }[]>;
    createDepartment(name: string, companyId: string, performedBy: string): Promise<{
        department_id: any;
        department_name: any;
    }>;
    renameDepartment(id: string, name: string, companyId: string, performedBy: string): Promise<{
        department_id: any;
        department_name: any;
    }>;
    deleteDepartment(id: string, companyId: string, performedBy: string): Promise<{
        deleted: boolean;
    }>;
    getDepartments(companyId: string): Promise<{
        department_id: any;
        department_name: any;
    }[]>;
    findAll(companyId: string): Promise<{
        role_ids: string[];
        role_name: any;
        last_login: string | null;
        invite_expires_at: string | null;
        user_id: string;
        employee_id: string;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
        role_id: string | null;
        department_id: string | null;
        start_date: string | null;
        account_status: string | null;
        avatar_url?: string | null;
    }[]>;
    findOne(id: string, companyId: string): Promise<{
        role_ids: any[];
        last_login: string | null;
        emergency_contacts: any;
        user_id: any;
        employee_id: any;
        username: any;
        first_name: any;
        middle_name: any;
        last_name: any;
        email: any;
        role_id: any;
        department_id: any;
        start_date: any;
        account_status: any;
        personal_email: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        complete_address: any;
        bank_name: any;
        bank_account_number: any;
        bank_account_name: any;
        avatar_url: any;
    } | null>;
    stats(companyId: string): Promise<{
        total: number;
    }>;
    create(dto: CreateUserDto, companyId: string, adminUserId: string): Promise<{
        user_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        start_date: string;
        invite_expires_at: string;
    }>;
    update(id: string, dto: UpdateUserDto, companyId: string, adminUserId: string): Promise<{
        message: string;
    } | {
        role_ids: any[];
        last_login: string | null;
        invite_expires_at: string | null;
        user_id: any;
        employee_id: any;
        username: any;
        first_name: any;
        middle_name: any;
        last_name: any;
        email: any;
        role_id: any;
        department_id: any;
        start_date: any;
        account_status: any;
        personal_email: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        complete_address: any;
        bank_name: any;
        bank_account_number: any;
        bank_account_name: any;
        avatar_url: any;
        message?: undefined;
    }>;
    remove(id: string, companyId: string, adminUserId: string): Promise<{
        message: string;
    }>;
    assignCompanyEmail(userId: string, newEmail: string, companyId: string, adminUserId: string): Promise<{
        message: string;
        email: string;
    }>;
    resendInvite(id: string, companyId: string, adminUserId: string): Promise<{
        message: string;
        invite_expires_at: string;
    }>;
    reactivate(id: string, companyId: string, adminUserId: string): Promise<{
        message: string;
    }>;
    private resolveOnboardingStaging;
    private extractEmergencyContacts;
    getMe(userId: string): Promise<{
        department_name: string | null;
        user_id: any;
        employee_id: any;
        first_name: any;
        middle_name: any;
        last_name: any;
        email: any;
        username: any;
        department_id: any;
        department: {
            department_name: any;
        }[];
        start_date: any;
        personal_email: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        complete_address: any;
        bank_name: any;
        bank_account_number: any;
        bank_account_name: any;
        avatar_url: any;
        emergency_contacts: any;
    }>;
    updateEmergencyContacts(userId: string, contacts: Array<{
        contact_name: string;
        relationship: string;
        emergency_phone_number: string;
        emergency_email_address?: string;
    }>): Promise<{
        message: string;
        emergency_contacts: {
            contact_name: string;
            relationship: string;
            emergency_phone_number: string;
            emergency_email_address?: string;
        }[];
    }>;
    updateMe(userId: string, body: {
        middle_name?: string;
        personal_email?: string;
        date_of_birth?: string;
        place_of_birth?: string;
        nationality?: string;
        civil_status?: string;
        complete_address?: string;
        bank_name?: string;
        bank_account_number?: string;
        bank_account_name?: string;
        avatar_url?: string;
        personal_notes?: string;
    }): Promise<{
        user_id: any;
        employee_id: any;
        first_name: any;
        middle_name: any;
        last_name: any;
        email: any;
        username: any;
        department_id: any;
        start_date: any;
        personal_email: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        complete_address: any;
        bank_name: any;
        bank_account_number: any;
        bank_account_name: any;
        avatar_url: any;
        personal_notes: any;
    } | {
        message: string;
    } | null>;
    getOnboardingStaging(userId: string): Promise<{
        first_name: any;
        last_name: any;
        middle_name: any;
        phone_number: any;
        complete_address: any;
        date_of_birth: any;
        place_of_birth: any;
        nationality: any;
        civil_status: any;
        personal_email: any;
    }>;
    private createEmployeeDocumentViewUrl;
    private extractFileNameFromStoragePath;
    getMyDocuments(userId: string): Promise<any[]>;
    uploadEmployeeDocument(userId: string, docType: string, file: Express.Multer.File): Promise<any>;
    deleteEmployeeDocument(userId: string, docId: string): Promise<{
        message: string;
    }>;
    approveEmployeeDocument(docId: string, reviewerId: string): Promise<{
        message: string;
        id: string;
        document_id?: undefined;
        is_replacement_request?: undefined;
    } | {
        message: string;
        id: any;
        document_id: any;
        is_replacement_request: boolean;
    }>;
    rejectEmployeeDocument(docId: string, reviewerId: string, hrNotes: string): Promise<{
        message: string;
        id: string;
        document_id?: undefined;
        is_replacement_request?: undefined;
    } | {
        message: string;
        id: any;
        document_id: any;
        is_replacement_request: boolean;
    }>;
    getPendingEmployeeDocuments(companyId: string): Promise<any[]>;
    submitDocumentReplacement(userId: string, docId: string, reason: string, file: Express.Multer.File, proofFile?: Express.Multer.File): Promise<{
        replacement_request_id: any;
        status: string;
    }>;
    submitChangeRequest(employeeId: string, companyId: string, dto: CreateChangeRequestDto): Promise<any>;
    getMyChangeRequests(employeeId: string): Promise<any[]>;
    getChangeRequestsForCompany(companyId: string, status?: string): Promise<any[]>;
    reviewChangeRequest(requestId: string, reviewerId: string, companyId: string, dto: ReviewChangeRequestDto): Promise<any>;
}
export {};
