import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ReviewChangeRequestDto } from './dto/review-change-request.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyCompany(req: any): Promise<{
        company_display_name: string | null;
        company_logo_url: string | null;
        company_id: any;
        company_name: any;
        slug: any;
    }>;
    findAll(req: any): Promise<{
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
    getRoles(req: any): Promise<{
        role_id: any;
        role_name: any;
    }[]>;
    createDepartment(name: string, req: any): Promise<{
        department_id: any;
        department_name: any;
    }>;
    stats(req: any): Promise<{
        total: number;
    }>;
    getDepartments(req: any): Promise<{
        department_id: any;
        department_name: any;
    }[]>;
    renameDepartment(id: string, name: string, req: any): Promise<{
        department_id: any;
        department_name: any;
    }>;
    deleteDepartment(id: string, req: any): Promise<{
        deleted: boolean;
    }>;
    getCompanies(req: any): Promise<{
        company_id: any;
        company_name: any;
    }[]>;
    getLifecyclePermissions(req: any): Promise<{
        module_id: string;
        name: string;
        description: string;
        icon: string;
        roles: {
            role_name: string;
            permissions: {
                update: boolean;
                read: boolean;
                create: boolean;
                delete: boolean;
            };
        }[];
    }[]>;
    saveLifecyclePermissions(modules: unknown, req: any): Promise<{
        module_id: string;
        name: string;
        description: string;
        icon: string;
        roles: {
            role_name: string;
            permissions: {
                update: boolean;
                read: boolean;
                create: boolean;
                delete: boolean;
            };
        }[];
    }[]>;
    getTenantConfig(req: any): Promise<any>;
    updateTenantConfig(req: any, body: {
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
    }): Promise<any>;
    getTenantModules(req: any): Promise<{
        id: any;
        company_id: any;
        module: any;
        status: any;
    }[] | {
        company_id: string;
        module: "onboarding" | "recruitment" | "compensation" | "performance" | "offboarding";
        status: string;
    }[]>;
    updateTenantModule(req: any, module: string, status: 'Active' | 'Inactive'): Promise<any>;
    getMyAccessibleModules(req: any): Promise<{
        module_id: string;
        name: string;
        can_read: boolean;
        can_create: boolean;
        can_update: boolean;
        can_delete: boolean;
    }[]>;
    submitChangeRequest(req: any, dto: CreateChangeRequestDto): Promise<any>;
    getMyChangeRequests(req: any): Promise<any[]>;
    getChangeRequests(req: any, status?: string): Promise<any[]>;
    reviewChangeRequest(requestId: string, req: any, dto: ReviewChangeRequestDto): Promise<any>;
    getMe(req: any): Promise<{
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
    updateMe(req: any, body: any): Promise<{
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
    getOnboardingStaging(req: any): Promise<{
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
    updateMyEmergencyContacts(req: any, body: {
        emergency_contacts: any[];
    }): Promise<{
        message: string;
        emergency_contacts: {
            contact_name: string;
            relationship: string;
            emergency_phone_number: string;
            emergency_email_address?: string;
        }[];
    }>;
    findOne(id: string, req: any): Promise<{
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
    create(createUserDto: CreateUserDto, req: any): Promise<{
        user_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        start_date: string;
        invite_expires_at: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    assignCompanyEmail(id: string, email: string, req: any): Promise<{
        message: string;
        email: string;
    }>;
    resendInvite(id: string, req: any): Promise<{
        message: string;
        invite_expires_at: string;
    }>;
    reactivate(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyDocuments(req: any): Promise<any[]>;
    uploadEmployeeDocument(req: any, file: Express.Multer.File, docType: string): Promise<any>;
    deleteEmployeeDocument(req: any, id: string): Promise<{
        message: string;
    }>;
    getPendingDocuments(req: any): Promise<any[]>;
    approveDocument(id: string, req: any): Promise<{
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
    rejectDocument(id: string, req: any, hrNotes: string): Promise<{
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
    submitDocumentReplacement(req: any, id: string, files: {
        file?: Express.Multer.File[];
        proof_file?: Express.Multer.File[];
    }, reason: string): Promise<{
        replacement_request_id: any;
        status: string;
    }>;
}
