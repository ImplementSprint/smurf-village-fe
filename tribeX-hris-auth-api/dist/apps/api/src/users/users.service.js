"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_service_1 = require("../mail/mail.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const timekeeping_service_1 = require("../timekeeping/timekeeping.service");
const common_2 = require("../../../../libs/common/src");
const crypto = __importStar(require("node:crypto"));
const PERMISSION_COLUMNS = {
    read: 'can_read',
    create: 'can_create',
    update: 'can_update',
    delete: 'can_delete',
};
const PERMISSION_KEYS = Object.keys(PERMISSION_COLUMNS);
const MULTI_PORTAL_ELIGIBLE_ROLE_NAMES = new Set([
    'hr officer',
    'hr recruiter',
    'hr interviewer',
    'hr compensation and benefits officer',
    'hr offboarding officer/coordinator',
    'hr onboarding officer',
    'hr performance management officer',
    'manager',
    'group head',
    'admin',
]);
function roleNameToPortal(roleName) {
    const normalized = String(roleName ?? '').trim().toLowerCase();
    if (normalized === 'system admin')
        return 'system-admin';
    if (normalized === 'admin')
        return 'admin';
    if (normalized === 'manager' || normalized === 'group head')
        return 'manager';
    if (normalized === 'active employee' || normalized === 'employee')
        return 'employee';
    if (normalized === 'applicant')
        return 'applicant';
    return 'hr';
}
const ROLE_DISPLAY_ORDER = [
    'System Admin',
    'Admin',
    'HR Officer',
    'HR Recruiter',
    'HR Interviewer',
    'HR Compensation and Benefits Officer',
    'HR Offboarding Officer/Coordinator',
    'HR Onboarding Officer',
    'HR Performance Management Officer',
    'Manager',
    'Group Head',
    'Active Employee',
    'Employee',
    'Applicant',
];
const EXCLUDED_HRIS_ROLE_NAMES = new Set(['System Admin', 'Admin']);
function getManilaDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}
const normalizeFeatureText = (value) => value?.trim().toLowerCase() ?? '';
const LIFECYCLE_MODULE_DEFINITIONS = [
    {
        module_id: 'recruitment',
        name: 'Recruitment',
        description: 'Job postings, candidate screening, interviews',
        icon: 'recruitment',
        matches: (feature) => {
            const featureName = normalizeFeatureText(feature.feature_name);
            const moduleGroup = normalizeFeatureText(feature.module_group);
            return (featureName === 'recruitment' || moduleGroup === 'recruitment');
        },
    },
    {
        module_id: 'onboarding',
        name: 'Onboarding',
        description: 'New hire paperwork, orientation, training setup',
        icon: 'onboarding',
        matches: (feature) => {
            const featureName = normalizeFeatureText(feature.feature_name);
            const moduleGroup = normalizeFeatureText(feature.module_group);
            return featureName === 'onboarding' || moduleGroup === 'onboarding';
        },
    },
    {
        module_id: 'compensation',
        name: 'Compensation & Benefits',
        description: 'Payroll, benefits administration, salary reviews',
        icon: 'compensation',
        matches: (feature) => {
            const featureName = normalizeFeatureText(feature.feature_name);
            const moduleGroup = normalizeFeatureText(feature.module_group);
            return (featureName === 'payroll' ||
                featureName === 'compensation' ||
                moduleGroup === 'compensation');
        },
    },
    {
        module_id: 'performance',
        name: 'Performance Management',
        description: 'Goal setting, appraisals, performance reviews',
        icon: 'performance',
        matches: (feature) => {
            const featureName = normalizeFeatureText(feature.feature_name);
            const moduleGroup = normalizeFeatureText(feature.module_group);
            return featureName === 'performance' || moduleGroup === 'performance';
        },
    },
    {
        module_id: 'offboarding',
        name: 'Offboarding',
        description: 'Exit interviews, clearance, account deactivation',
        icon: 'offboarding',
        matches: (feature) => {
            const featureName = normalizeFeatureText(feature.feature_name);
            const moduleGroup = normalizeFeatureText(feature.module_group);
            return featureName === 'offboarding' || moduleGroup === 'offboarding';
        },
    },
];
let UsersService = UsersService_1 = class UsersService {
    supabaseService;
    mailService;
    config;
    auditService;
    notificationsService;
    timekeepingService;
    logger = new common_1.Logger(UsersService_1.name);
    VALID_MODULES = [
        'recruitment',
        'onboarding',
        'compensation',
        'performance',
        'offboarding',
    ];
    constructor(supabaseService, mailService, config, auditService, notificationsService, timekeepingService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
        this.config = config;
        this.auditService = auditService;
        this.notificationsService = notificationsService;
        this.timekeepingService = timekeepingService;
    }
    async syncUserPortalAssignments(params) {
        const supabase = this.supabaseService.getClient();
        const roleName = String(params.roleName ?? '').trim();
        const normalizedRoleName = roleName.toLowerCase();
        const targetPortal = roleNameToPortal(roleName);
        if (params.setPrimary) {
            await supabase
                .from('user_role_assignments')
                .update({ is_primary: false, is_active: false })
                .eq('user_id', params.userId);
        }
        const { data: existingRows } = await supabase
            .from('user_role_assignments')
            .select('assignment_id')
            .eq('user_id', params.userId)
            .eq('role_id', params.roleId)
            .limit(1);
        const existingAssignmentId = existingRows?.[0]?.assignment_id;
        if (existingAssignmentId) {
            await supabase
                .from('user_role_assignments')
                .update({ is_primary: !!params.setPrimary, is_active: true })
                .eq('assignment_id', existingAssignmentId);
        }
        else {
            await supabase
                .from('user_role_assignments')
                .insert({
                user_id: params.userId,
                role_id: params.roleId,
                is_primary: !!params.setPrimary,
                is_active: true,
            });
        }
        await supabase.from('role_portal_map').upsert({
            role_id: params.roleId,
            portal_key: targetPortal,
        }, { onConflict: 'role_id,portal_key' });
        await supabase
            .from('role_portal_map')
            .delete()
            .eq('role_id', params.roleId)
            .neq('portal_key', targetPortal);
        if (normalizedRoleName === 'system admin') {
            await supabase
                .from('user_role_assignments')
                .update({ is_active: false, is_primary: false })
                .eq('user_id', params.userId)
                .neq('role_id', params.roleId);
            await supabase
                .from('user_role_assignments')
                .update({ is_active: true, is_primary: true })
                .eq('user_id', params.userId)
                .eq('role_id', params.roleId);
            return;
        }
        if (!MULTI_PORTAL_ELIGIBLE_ROLE_NAMES.has(normalizedRoleName)) {
            return;
        }
        const { data: employeeRole } = await supabase
            .from('role')
            .select('role_id')
            .eq('company_id', params.companyId)
            .in('role_name', ['Active Employee', 'Employee'])
            .order('role_name', { ascending: true })
            .maybeSingle();
        if (!employeeRole?.role_id)
            return;
        const { data: existingEmpRows } = await supabase
            .from('user_role_assignments')
            .select('assignment_id')
            .eq('user_id', params.userId)
            .eq('role_id', String(employeeRole.role_id))
            .limit(1);
        const existingEmpAssignmentId = existingEmpRows?.[0]?.assignment_id;
        if (existingEmpAssignmentId) {
            await supabase
                .from('user_role_assignments')
                .update({ is_primary: false, is_active: true })
                .eq('assignment_id', existingEmpAssignmentId);
        }
        else {
            await supabase
                .from('user_role_assignments')
                .insert({
                user_id: params.userId,
                role_id: String(employeeRole.role_id),
                is_primary: false,
                is_active: true,
            });
        }
        await supabase.from('role_portal_map').upsert({
            role_id: String(employeeRole.role_id),
            portal_key: 'employee',
        }, { onConflict: 'role_id,portal_key' });
        await supabase
            .from('role_portal_map')
            .delete()
            .eq('role_id', String(employeeRole.role_id))
            .neq('portal_key', 'employee');
    }
    buildEmptyPermissionSet() {
        return {
            read: false,
            create: false,
            update: false,
            delete: false,
        };
    }
    compareRoleNames(a, b) {
        const aIndex = ROLE_DISPLAY_ORDER.indexOf(a);
        const bIndex = ROLE_DISPLAY_ORDER.indexOf(b);
        if (aIndex === -1 && bIndex === -1)
            return a.localeCompare(b);
        if (aIndex === -1)
            return 1;
        if (bIndex === -1)
            return -1;
        return aIndex - bIndex;
    }
    parseModuleRoleEntry(roleEntry, moduleId, roleNames) {
        if (!roleEntry || typeof roleEntry !== 'object') {
            throw new common_1.BadRequestException(`Module "${moduleId}" has an invalid role entry.`);
        }
        const roleRecord = roleEntry;
        const roleName = roleRecord.role_name;
        if (typeof roleName !== 'string' || !roleName.trim()) {
            throw new common_1.BadRequestException(`Module "${moduleId}" is missing a role_name.`);
        }
        if (!roleNames.includes(roleName)) {
            throw new common_1.BadRequestException(`Module "${moduleId}" includes an unknown role "${roleName}".`);
        }
        const permissions = roleRecord.permissions;
        if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
            throw new common_1.BadRequestException(`Module "${moduleId}" must include a permissions object for "${roleName}".`);
        }
        const permissionMap = permissions;
        const normalizedPermissions = {};
        for (const permissionKey of PERMISSION_KEYS) {
            const permVal = permissionMap[permissionKey];
            if (typeof permVal !== 'boolean') {
                throw new common_1.BadRequestException(`Module "${moduleId}" is missing a boolean "${permissionKey}" permission for "${roleName}".`);
            }
            normalizedPermissions[permissionKey] = permVal;
        }
        return { roleName, permissions: normalizedPermissions };
    }
    normalizeLifecycleModules(input, roleNames) {
        if (!Array.isArray(input) || input.length === 0) {
            throw new common_1.BadRequestException('Lifecycle permissions must be a non-empty array.');
        }
        const providedById = new Map();
        for (const item of input) {
            if (!item || typeof item !== 'object') {
                throw new common_1.BadRequestException('Each lifecycle permission entry must be an object.');
            }
            const entry = item;
            const moduleId = entry.module_id;
            if (typeof moduleId !== 'string' || !moduleId.trim()) {
                throw new common_1.BadRequestException('Each entry must include a module_id.');
            }
            if (providedById.has(moduleId)) {
                throw new common_1.BadRequestException(`Duplicate lifecycle module "${moduleId}" found.`);
            }
            providedById.set(moduleId, entry);
        }
        for (const moduleId of providedById.keys()) {
            if (!LIFECYCLE_MODULE_DEFINITIONS.some((d) => d.module_id === moduleId)) {
                throw new common_1.BadRequestException(`Unknown lifecycle module "${moduleId}".`);
            }
        }
        return LIFECYCLE_MODULE_DEFINITIONS.map((defaultModule) => {
            const provided = providedById.get(defaultModule.module_id);
            const providedRoles = Array.isArray(provided?.roles) ? provided.roles : [];
            const providedRolesByName = new Map();
            for (const roleEntry of providedRoles) {
                const { roleName, permissions } = this.parseModuleRoleEntry(roleEntry, defaultModule.module_id, roleNames);
                if (providedRolesByName.has(roleName)) {
                    throw new common_1.BadRequestException(`Module "${defaultModule.module_id}" includes duplicate role "${roleName}".`);
                }
                providedRolesByName.set(roleName, permissions);
            }
            return {
                ...defaultModule,
                roles: roleNames.map((roleName) => ({
                    role_name: roleName,
                    permissions: providedRolesByName.get(roleName) ?? this.buildEmptyPermissionSet(),
                })),
            };
        });
    }
    async validateDepartmentBelongsToCompany(supabase, dto, companyId) {
        if (!dto.department_id)
            return;
        const { data: departmentRow, error: departmentError } = await supabase
            .from('department')
            .select('department_id, company_id')
            .eq('department_id', dto.department_id)
            .maybeSingle();
        if (departmentError)
            throw new common_1.InternalServerErrorException(departmentError.message);
        if (!departmentRow)
            throw new common_1.BadRequestException('Selected department does not exist.');
        if (departmentRow.company_id && departmentRow.company_id !== companyId) {
            throw new common_1.BadRequestException('Selected department belongs to a different company.');
        }
    }
    async validateRoleBelongsToCompany(supabase, roleId, companyId) {
        const { data: roleRow, error: roleError } = await supabase
            .from('role')
            .select('role_id, company_id')
            .eq('role_id', roleId)
            .maybeSingle();
        if (roleError)
            throw new common_1.InternalServerErrorException(roleError.message);
        if (!roleRow)
            throw new common_1.BadRequestException('Selected role does not exist.');
        if (roleRow.company_id && roleRow.company_id !== companyId) {
            throw new common_1.BadRequestException('Selected role belongs to a different company.');
        }
    }
    normalizeOptionalString(value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('Expected a string value.');
        }
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : null;
    }
    isMissingDatabaseObject(error, objectName) {
        const message = String(error?.message ?? '').toLowerCase();
        return (message.includes(objectName.toLowerCase()) &&
            (message.includes('does not exist') || message.includes('relation') || message.includes('column')));
    }
    throwInsertUserError(insertError) {
        const dbCode = insertError?.code;
        if (dbCode === '23505') {
            throw new common_1.ConflictException('A user with the same username or email already exists.');
        }
        if (dbCode === '23503') {
            throw new common_1.BadRequestException('Invalid role or department selected.');
        }
        throw new common_1.BadRequestException(insertError.message);
    }
    collectModuleRows(module, roleGroups, moduleFeatureIds, rowsToUpsert) {
        for (const roleSetting of module.roles) {
            const roleGroup = roleGroups.find((g) => g.role_name === roleSetting.role_name);
            if (!roleGroup)
                continue;
            for (const roleId of roleGroup.role_ids) {
                for (const featureId of moduleFeatureIds) {
                    rowsToUpsert.push({
                        role_id: roleId,
                        feature_id: featureId,
                        can_read: roleSetting.permissions.read,
                        can_create: roleSetting.permissions.create,
                        can_update: roleSetting.permissions.update,
                        can_delete: roleSetting.permissions.delete,
                    });
                }
            }
        }
    }
    mapRoleIdsByRoleName(roles) {
        const grouped = new Map();
        for (const role of roles) {
            const roleName = role.role_name?.trim();
            if (!roleName || EXCLUDED_HRIS_ROLE_NAMES.has(roleName))
                continue;
            if (!grouped.has(roleName)) {
                grouped.set(roleName, []);
            }
            grouped.get(roleName)?.push(role.role_id);
        }
        return [...grouped.entries()]
            .map(([role_name, role_ids]) => ({
            role_name,
            role_ids,
        }))
            .sort((left, right) => this.compareRoleNames(left.role_name, right.role_name));
    }
    mapFeatureIdsByModule(features) {
        return Object.fromEntries(LIFECYCLE_MODULE_DEFINITIONS.map((module) => [
            module.module_id,
            features
                .filter((feature) => module.matches(feature))
                .map((feature) => feature.feature_id),
        ]));
    }
    async getLifecyclePermissions(companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException('Your account has no company assignment.');
        }
        const supabase = this.supabaseService.getClient();
        const [{ data: roles, error: rolesError }, { data: features, error: featuresError }] = await Promise.all([
            supabase
                .from('role')
                .select('role_id, role_name')
                .eq('company_id', companyId),
            supabase
                .from('feature')
                .select('feature_id, feature_name, module_group, is_active')
                .eq('is_active', true),
        ]);
        if (rolesError)
            throw new common_1.InternalServerErrorException(rolesError.message);
        if (featuresError)
            throw new common_1.InternalServerErrorException(featuresError.message);
        const roleRows = roles ?? [];
        const featureRows = features ?? [];
        const roleGroups = this.mapRoleIdsByRoleName(roleRows);
        const featureIdsByModule = this.mapFeatureIdsByModule(featureRows);
        const allRoleIds = [...new Set(roleGroups.flatMap((group) => group.role_ids))];
        const allFeatureIds = [
            ...new Set(Object.values(featureIdsByModule).flat()),
        ];
        let roleFeatureRows = [];
        if (allRoleIds.length > 0 && allFeatureIds.length > 0) {
            const { data, error } = await supabase
                .from('role_feature')
                .select('role_id, feature_id, can_read, can_create, can_update, can_delete')
                .in('role_id', allRoleIds)
                .in('feature_id', allFeatureIds);
            if (error) {
                throw new common_1.InternalServerErrorException(error.message);
            }
            roleFeatureRows = data ?? [];
        }
        const roleFeatureMap = new Map(roleFeatureRows.map((row) => [`${row.role_id}:${row.feature_id}`, row]));
        return LIFECYCLE_MODULE_DEFINITIONS.map((module) => {
            const moduleFeatureIds = featureIdsByModule[module.module_id] ?? [];
            return {
                module_id: module.module_id,
                name: module.name,
                description: module.description,
                icon: module.icon,
                roles: roleGroups.map((roleGroup) => {
                    const permissions = {};
                    for (const permissionKey of PERMISSION_KEYS) {
                        const column = PERMISSION_COLUMNS[permissionKey];
                        permissions[permissionKey] =
                            moduleFeatureIds.length > 0 &&
                                roleGroup.role_ids.length > 0 &&
                                roleGroup.role_ids.every((roleId) => moduleFeatureIds.every((featureId) => roleFeatureMap.get(`${roleId}:${featureId}`)?.[column] ===
                                    true));
                    }
                    return {
                        role_name: roleGroup.role_name,
                        permissions,
                    };
                }),
            };
        });
    }
    async saveLifecyclePermissions(modules, companyId, adminUserId) {
        if (!companyId) {
            throw new common_1.BadRequestException('Your account has no company assignment.');
        }
        const supabase = this.supabaseService.getClient();
        const [{ data: roles, error: rolesError }, { data: features, error: featuresError }] = await Promise.all([
            supabase
                .from('role')
                .select('role_id, role_name')
                .eq('company_id', companyId),
            supabase
                .from('feature')
                .select('feature_id, feature_name, module_group, is_active')
                .eq('is_active', true),
        ]);
        if (rolesError)
            throw new common_1.InternalServerErrorException(rolesError.message);
        if (featuresError)
            throw new common_1.InternalServerErrorException(featuresError.message);
        const roleRows = roles ?? [];
        const featureRows = features ?? [];
        const roleGroups = this.mapRoleIdsByRoleName(roleRows);
        const roleNames = roleGroups.map((role) => role.role_name);
        const featureIdsByModule = this.mapFeatureIdsByModule(featureRows);
        const normalizedModules = this.normalizeLifecycleModules(modules, roleNames);
        const rowsToUpsert = [];
        for (const module of normalizedModules) {
            const moduleFeatureIds = featureIdsByModule[module.module_id] ?? [];
            if (moduleFeatureIds.length === 0) {
                throw new common_1.BadRequestException(`No features are configured in the database for "${module.name}".`);
            }
            this.collectModuleRows(module, roleGroups, moduleFeatureIds, rowsToUpsert);
        }
        if (rowsToUpsert.length > 0) {
            const { error } = await supabase
                .from('role_feature')
                .upsert(rowsToUpsert, { onConflict: 'role_id,feature_id' });
            if (error) {
                throw new common_1.InternalServerErrorException(error.message);
            }
        }
        await this.auditService.log('Global lifecycle permissions updated', adminUserId, companyId);
        return this.getLifecyclePermissions(companyId);
    }
    async getTenantConfig(companyId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tenant_config')
            .select('*')
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data) {
            return {
                company_id: companyId,
                timezone: 'Asia/Manila',
                date_format: 'MM/DD/YYYY',
                currency: 'PHP',
                org_structure: null,
                payroll_settings: {
                    working_days_per_year: 260,
                    overtime_multiplier: 1.25,
                    late_deduction_per_hour: 50,
                    night_shift_diff_multiplier: 1.1,
                },
                branding_settings: {
                    company_display_name: null,
                    company_logo_url: null,
                },
            };
        }
        return data;
    }
    async updateTenantConfig(companyId, updates, adminUserId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tenant_config')
            .upsert({ company_id: companyId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'company_id' })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        await this.auditService.log('Tenant config updated', adminUserId, companyId);
        return data;
    }
    async getTenantModules(companyId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tenant_modules')
            .select('id, company_id, module, status')
            .eq('company_id', companyId)
            .order('module');
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data || data.length === 0) {
            return this.VALID_MODULES.map((module) => ({
                company_id: companyId,
                module,
                status: 'Active',
            }));
        }
        return data;
    }
    async updateTenantModule(companyId, module, status, adminUserId) {
        if (!this.VALID_MODULES.includes(module)) {
            throw new common_1.BadRequestException(`Invalid module "${module}". Must be one of: ${this.VALID_MODULES.join(', ')}`);
        }
        const { data, error } = await this.supabaseService
            .getClient()
            .from('tenant_modules')
            .upsert({ company_id: companyId, module, status }, { onConflict: 'company_id,module' })
            .select()
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        await this.auditService.log(`Module ${module} set to ${status}`, adminUserId, companyId);
        return data;
    }
    async getMyAccessibleModules(roleId, companyId) {
        const supabase = this.supabaseService.getClient();
        const [{ data: features, error: featuresError }, { data: roleFeatures, error: roleFeaturesError },] = await Promise.all([
            supabase
                .from('feature')
                .select('feature_id, feature_name, module_group, is_active')
                .eq('is_active', true),
            supabase
                .from('role_feature')
                .select('feature_id, can_read, can_create, can_update, can_delete')
                .eq('role_id', roleId),
        ]);
        if (featuresError)
            throw new common_1.InternalServerErrorException(featuresError.message);
        if (roleFeaturesError) {
            throw new common_1.InternalServerErrorException(roleFeaturesError.message);
        }
        const roleFeatureMap = new Map((roleFeatures ?? []).map((rf) => [rf.feature_id, rf]));
        const featureIdsByModule = this.mapFeatureIdsByModule((features ?? []));
        const tenantModulesById = new Map();
        const { data: tenantModules, error: tenantModulesError } = await supabase
            .from('tenant_modules')
            .select('module, status')
            .eq('company_id', companyId);
        if (tenantModulesError) {
            throw new common_1.InternalServerErrorException(tenantModulesError.message);
        }
        for (const row of tenantModules ?? []) {
            if (row.module) {
                tenantModulesById.set(row.module, row.status ?? 'Active');
            }
        }
        return LIFECYCLE_MODULE_DEFINITIONS.map((module) => {
            const featureIds = featureIdsByModule[module.module_id] ?? [];
            const moduleStatus = tenantModulesById.get(module.module_id) ?? 'Active';
            const isModuleActive = moduleStatus === 'Active';
            const can_read = isModuleActive &&
                featureIds.some((fid) => roleFeatureMap.get(fid)?.can_read === true);
            const can_create = isModuleActive &&
                featureIds.some((fid) => roleFeatureMap.get(fid)?.can_create === true);
            const can_update = isModuleActive &&
                featureIds.some((fid) => roleFeatureMap.get(fid)?.can_update === true);
            const can_delete = isModuleActive &&
                featureIds.some((fid) => roleFeatureMap.get(fid)?.can_delete === true);
            return {
                module_id: module.module_id,
                name: module.name,
                can_read,
                can_create,
                can_update,
                can_delete,
            };
        });
    }
    async getCompanies(companyId) {
        const supabase = this.supabaseService.getClient();
        const baseQuery = supabase
            .from('company')
            .select('company_id, company_name')
            .order('company_name');
        const { data, error } = companyId
            ? await baseQuery.eq('company_id', companyId)
            : await baseQuery;
        if (error)
            throw new Error(error.message);
        return data ?? [];
    }
    async getCompanyInfo(companyId) {
        const supabase = this.supabaseService.getClient();
        const [{ data, error }, { data: tenantConfig, error: tenantError }] = await Promise.all([
            supabase
                .from('company')
                .select('company_id, company_name, slug')
                .eq('company_id', companyId)
                .maybeSingle(),
            supabase
                .from('tenant_config')
                .select('branding_settings')
                .eq('company_id', companyId)
                .maybeSingle(),
        ]);
        if (error)
            throw new Error(error.message);
        if (tenantError && !this.isMissingDatabaseObject(tenantError, 'branding_settings')) {
            throw new Error(tenantError.message);
        }
        if (!data)
            throw new common_1.NotFoundException('Company not found');
        const branding = tenantConfig?.branding_settings ?? null;
        return {
            ...data,
            company_display_name: typeof branding?.company_display_name === 'string'
                ? branding.company_display_name
                : null,
            company_logo_url: typeof branding?.company_logo_url === 'string'
                ? branding.company_logo_url
                : null,
        };
    }
    async getNextEmployeeNumber(companyId) {
        const supabase = this.supabaseService.getClient();
        for (let attempt = 0; attempt < 5; attempt++) {
            const { data: seqRow, error: seqReadError } = await supabase
                .from('employee_id_sequence')
                .select('last_number')
                .eq('company_id', companyId)
                .maybeSingle();
            if (seqReadError)
                throw new common_1.InternalServerErrorException(seqReadError.message);
            if (!seqRow) {
                const { error: seedError } = await supabase
                    .from('employee_id_sequence')
                    .insert({ company_id: companyId, last_number: 0 });
                if (seedError && seedError.code !== '23505') {
                    throw new common_1.InternalServerErrorException(seedError.message);
                }
                continue;
            }
            const current = Number(seqRow.last_number ?? 0);
            const next = current + 1;
            const { data: updatedRow, error: seqUpdateError } = await supabase
                .from('employee_id_sequence')
                .update({ last_number: next })
                .eq('company_id', companyId)
                .eq('last_number', current)
                .select('last_number')
                .maybeSingle();
            if (seqUpdateError)
                throw new common_1.InternalServerErrorException(seqUpdateError.message);
            if (updatedRow)
                return Number(updatedRow.last_number);
        }
        throw new common_1.InternalServerErrorException('Could not generate employee number due to concurrent updates. Please try again.');
    }
    async getInviteExpiryMap(userIds) {
        if (userIds.length === 0)
            return {};
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_invites')
            .select('user_id, expires_at')
            .is('used_at', null)
            .in('user_id', userIds)
            .order('expires_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        const map = {};
        for (const row of data ?? []) {
            if (!map[row.user_id])
                map[row.user_id] = row.expires_at;
        }
        return map;
    }
    async getLastLoginMap(userIds) {
        if (userIds.length === 0)
            return {};
        const { data, error } = await this.supabaseService
            .getClient()
            .from('login_history')
            .select('user_id, li_timestamp')
            .eq('status', 'SUCCESS')
            .in('user_id', userIds)
            .order('li_timestamp', { ascending: false });
        if (error)
            throw new Error(error.message);
        const lastLoginByUser = {};
        for (const row of data ?? []) {
            if (!lastLoginByUser[row.user_id]) {
                lastLoginByUser[row.user_id] = row.li_timestamp;
            }
        }
        return lastLoginByUser;
    }
    async inheritDepartmentScheduleForEmployee(companyId, departmentId, employeeId, updaterName) {
        const supabase = this.supabaseService.getClient();
        const effectiveFrom = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
        }).format(new Date());
        const { data: existingSchedule, error: existingScheduleError } = await supabase
            .from('schedules')
            .select('schedule_source')
            .eq('employee_id', employeeId)
            .lte('effective_from', effectiveFrom)
            .order('effective_from', { ascending: false })
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (existingScheduleError) {
            throw new Error(existingScheduleError.message);
        }
        if (existingSchedule?.schedule_source === 'individual') {
            return;
        }
        const { data: departmentMembers, error: departmentMembersError } = await supabase
            .from('user_profile')
            .select('employee_id')
            .eq('company_id', companyId)
            .eq('department_id', departmentId)
            .not('employee_id', 'is', null)
            .neq('employee_id', employeeId)
            .limit(200);
        if (departmentMembersError) {
            throw new Error(departmentMembersError.message);
        }
        const memberEmployeeIds = (departmentMembers ?? [])
            .map((member) => member.employee_id)
            .filter((id) => typeof id === 'string' && id.length > 0);
        if (memberEmployeeIds.length === 0)
            return;
        const { data: departmentSchedule, error: departmentScheduleError } = await supabase
            .from('schedules')
            .select('start_time, end_time, break_start, break_end, workdays, is_nightshift')
            .in('employee_id', memberEmployeeIds)
            .neq('schedule_source', 'individual')
            .lte('effective_from', effectiveFrom)
            .order('effective_from', { ascending: false })
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (departmentScheduleError) {
            throw new Error(departmentScheduleError.message);
        }
        if (!departmentSchedule)
            return;
        const { error: upsertError } = await supabase.from('schedules').upsert({
            employee_id: employeeId,
            effective_from: effectiveFrom,
            start_time: departmentSchedule.start_time,
            end_time: departmentSchedule.end_time,
            break_start: departmentSchedule.break_start ?? '00:00',
            break_end: departmentSchedule.break_end ?? '00:00',
            workdays: departmentSchedule.workdays,
            is_nightshift: departmentSchedule.is_nightshift ?? false,
            schedule_source: 'bulk',
            updated_by_name: updaterName,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'employee_id,effective_from' });
        if (upsertError) {
            throw new Error(upsertError.message);
        }
    }
    async getRoles(companyId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('role')
            .select('role_id, role_name')
            .eq('company_id', companyId)
            .order('role_name');
        if (error)
            throw new Error(error.message);
        return data ?? [];
    }
    async createDepartment(name, companyId, performedBy) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('department')
            .insert({ department_name: name, company_id: companyId })
            .select('department_id, department_name')
            .single();
        if (error) {
            if (error.code === '23505') {
                await this.auditService.logIncident(`Department creation failed: "${name}" already exists`, 'WARNING', { companyId, performedBy });
                throw new common_1.ConflictException(`Department "${name}" already exists`);
            }
            await this.auditService.logIncident(`Department creation failed: "${name}" — ${error.message}`, 'ERROR', { companyId, performedBy });
            throw new Error(error.message);
        }
        await this.auditService.log(`Department created: "${name}"`, performedBy, companyId);
        return data;
    }
    async renameDepartment(id, name, companyId, performedBy) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('department')
            .update({ department_name: name })
            .eq('department_id', id)
            .eq('company_id', companyId)
            .select('department_id, department_name')
            .single();
        if (error)
            throw new Error(error.message);
        if (!data)
            throw new common_1.NotFoundException('Department not found.');
        await this.auditService.log(`Department renamed to "${name}"`, performedBy, companyId);
        return data;
    }
    async deleteDepartment(id, companyId, performedBy) {
        const supabase = this.supabaseService.getClient();
        const { data: dept } = await supabase
            .from('department')
            .select('department_name')
            .eq('department_id', id)
            .eq('company_id', companyId)
            .single();
        await supabase
            .from('user_profile')
            .update({ department_id: null })
            .eq('department_id', id)
            .eq('company_id', companyId);
        const { error } = await supabase
            .from('department')
            .delete()
            .eq('department_id', id)
            .eq('company_id', companyId);
        if (error)
            throw new Error(error.message);
        await this.auditService.log(`Department deleted: "${dept?.department_name ?? 'Unknown'}"`, performedBy, companyId);
        return { deleted: true };
    }
    async getDepartments(companyId) {
        if (!companyId)
            return [];
        const { data, error } = await this.supabaseService
            .getClient()
            .from('department')
            .select('department_id, department_name')
            .eq('company_id', companyId)
            .order('department_name');
        if (error)
            throw new Error(error.message);
        return data ?? [];
    }
    async findAll(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, username, first_name, last_name, email, role_id, department_id, start_date, account_status, avatar_url')
            .eq('company_id', companyId)
            .order('first_name');
        if (error)
            throw new Error(error.message);
        const users = (data ?? []);
        const userIds = users.map((user) => user.user_id);
        const [lastLoginByUser, inviteExpiryByUser, assignmentsResult] = await Promise.all([
            this.getLastLoginMap(userIds),
            this.getInviteExpiryMap(userIds),
            userIds.length > 0
                ? supabase
                    .from('user_role_assignments')
                    .select('user_id, role_id')
                    .in('user_id', userIds)
                    .eq('is_active', true)
                : Promise.resolve({ data: [] }),
        ]);
        const roleIdsByUser = new Map();
        for (const a of assignmentsResult.data ?? []) {
            const list = roleIdsByUser.get(a.user_id) ?? [];
            list.push(a.role_id);
            roleIdsByUser.set(a.user_id, list);
        }
        const allRoleIds = [
            ...new Set([
                ...users.map((u) => u.role_id).filter((id) => !!id),
                ...(assignmentsResult.data ?? []).map((a) => a.role_id),
            ]),
        ];
        const rolesData = allRoleIds.length > 0
            ? await supabase.from('role').select('role_id, role_name').in('role_id', allRoleIds).then((r) => r.data ?? [])
            : [];
        const roleNameById = new Map(rolesData.map((r) => [r.role_id, r.role_name ?? null]));
        return users.map((user) => {
            const assignedRoleIds = roleIdsByUser.get(user.user_id) ?? (user.role_id ? [user.role_id] : []);
            return {
                ...user,
                role_ids: assignedRoleIds,
                role_name: user.role_id ? roleNameById.get(user.role_id) ?? null : null,
                last_login: lastLoginByUser[user.user_id] ?? null,
                invite_expires_at: inviteExpiryByUser[user.user_id] ?? null,
            };
        });
    }
    async findOne(id, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, username, first_name, middle_name, last_name, email, role_id, department_id, start_date, account_status, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, bank_name, bank_account_number, bank_account_name, avatar_url, emergency_contacts')
            .eq('user_id', id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        if (!data)
            return data;
        const [lastLoginByUser, assignmentsResult] = await Promise.all([
            this.getLastLoginMap([id]),
            supabase
                .from('user_role_assignments')
                .select('role_id')
                .eq('user_id', id)
                .eq('is_active', true),
        ]);
        const role_ids = (assignmentsResult.data ?? []).map((a) => a.role_id);
        let emergency_contacts = Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [];
        if (emergency_contacts.length === 0) {
            const staging = await this.resolveOnboardingStaging(id, data.email);
            emergency_contacts = this.extractEmergencyContacts(staging);
        }
        return {
            ...data,
            role_ids: role_ids.length > 0 ? role_ids : (data.role_id ? [data.role_id] : []),
            last_login: lastLoginByUser[id] ?? null,
            emergency_contacts,
        };
    }
    async stats(companyId) {
        const { count, error } = await this.supabaseService
            .getClient()
            .from('user_profile')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);
        if (error)
            throw new Error(error.message);
        return { total: count ?? 0 };
    }
    async create(dto, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const user_id = crypto.randomUUID();
        const email = dto.email.trim();
        const nextNumber = await this.getNextEmployeeNumber(companyId);
        const employee_id = `empno-${String(nextNumber).padStart(5, '0')}`;
        const { data: existingUsername } = await supabase
            .from('user_profile')
            .select('user_id')
            .eq('username', dto.username)
            .maybeSingle();
        if (existingUsername) {
            throw new common_1.ConflictException(`Username "${dto.username}" is already taken`);
        }
        const primaryRoleId = dto.role_ids[0];
        const { data: roleRow, error: roleError } = await supabase
            .from('role')
            .select('role_id, role_name, company_id')
            .eq('role_id', primaryRoleId)
            .maybeSingle();
        if (roleError)
            throw new common_1.InternalServerErrorException(roleError.message);
        if (!roleRow)
            throw new common_1.BadRequestException('Selected role does not exist.');
        if (roleRow.company_id && roleRow.company_id !== companyId) {
            throw new common_1.BadRequestException('Selected role belongs to a different company.');
        }
        for (const roleId of dto.role_ids.slice(1)) {
            await this.validateRoleBelongsToCompany(supabase, roleId, companyId);
        }
        await this.validateDepartmentBelongsToCompany(supabase, dto, companyId);
        const startDate = dto.start_date ?? getManilaDateKey();
        const firstName = (0, common_2.normalizeNamePart)(dto.first_name);
        const lastName = (0, common_2.normalizeNamePart)(dto.last_name);
        if (!firstName || !lastName) {
            throw new common_1.BadRequestException('First name and last name are required.');
        }
        const { error: insertError } = await supabase.from('user_profile').insert({
            user_id,
            email,
            first_name: firstName,
            last_name: lastName,
            role_id: primaryRoleId,
            company_id: companyId,
            employee_id,
            username: dto.username,
            account_status: 'Pending',
            start_date: startDate,
            ...(dto.department_id ? { department_id: dto.department_id } : {}),
        });
        if (insertError) {
            this.throwInsertUserError(insertError);
        }
        await this.syncUserPortalAssignments({
            userId: user_id,
            companyId,
            roleId: primaryRoleId,
            roleName: roleRow.role_name,
            setPrimary: true,
        });
        for (const extraRoleId of dto.role_ids.slice(1)) {
            const { data: extraRoleRow } = await supabase
                .from('role')
                .select('role_name')
                .eq('role_id', extraRoleId)
                .maybeSingle();
            await this.syncUserPortalAssignments({
                userId: user_id,
                companyId,
                roleId: extraRoleId,
                roleName: extraRoleRow?.role_name ?? null,
                setPrimary: false,
            });
        }
        try {
            await this.timekeepingService.assignInitialScheduleForEmployee({
                companyId,
                employeeId: employee_id,
                departmentId: dto.department_id ?? null,
                effectiveDate: startDate,
                updatedByName: null,
            });
        }
        catch (scheduleError) {
            this.logger.warn(`Could not assign initial schedule for user ${user_id}: ${scheduleError instanceof Error ? scheduleError.message : String(scheduleError)}`);
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: inviteError } = await supabase.from('user_invites').insert({
            invite_id: crypto.randomUUID(),
            user_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (inviteError)
            throw new common_1.InternalServerErrorException(inviteError.message);
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const inviteLink = `${appUrl}/set-password?token=${rawToken}`;
        try {
            await this.mailService.sendInvite(email, inviteLink);
        }
        catch (emailError) {
            this.logger.warn(`[create] email error: ${emailError?.message ?? emailError}`);
            if (this.config.get('NODE_ENV') !== 'production') {
                this.logger.debug(`DEV MODE - invite link | Recipient: ${email} | Link: ${inviteLink}`);
            }
        }
        await this.auditService.log(`User created: ${email}`, adminUserId, companyId, user_id);
        return {
            user_id,
            employee_id,
            email,
            username: dto.username,
            first_name: firstName,
            last_name: lastName,
            start_date: startDate,
            invite_expires_at: expiresAt,
        };
    }
    async update(id, dto, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error: findError } = await supabase
            .from('user_profile')
            .select('user_id, email, first_name, last_name, role_id, department_id, start_date')
            .eq('user_id', id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!user)
            throw new common_1.NotFoundException('User not found in your company');
        const updates = {};
        const normalizedFirstName = this.normalizeOptionalString(dto.first_name);
        const normalizedLastName = this.normalizeOptionalString(dto.last_name);
        const roleIdsToAssign = dto.role_ids && dto.role_ids.length > 0 ? dto.role_ids : undefined;
        const normalizedRoleId = roleIdsToAssign?.[0];
        let normalizedRoleName = null;
        const normalizedDepartmentId = this.normalizeOptionalString(dto.department_id);
        const normalizedStartDate = this.normalizeOptionalString(dto.start_date);
        const normalizedAccountStatus = this.normalizeOptionalString(dto.account_status);
        if (normalizedFirstName !== undefined) {
            if (!normalizedFirstName) {
                throw new common_1.BadRequestException('first_name cannot be empty.');
            }
            updates.first_name = (0, common_2.normalizeNamePart)(normalizedFirstName);
        }
        if (normalizedLastName !== undefined) {
            if (!normalizedLastName) {
                throw new common_1.BadRequestException('last_name cannot be empty.');
            }
            updates.last_name = (0, common_2.normalizeNamePart)(normalizedLastName);
        }
        if (roleIdsToAssign !== undefined) {
            await this.validateRoleBelongsToCompany(supabase, normalizedRoleId, companyId);
            for (const roleId of roleIdsToAssign.slice(1)) {
                await this.validateRoleBelongsToCompany(supabase, roleId, companyId);
            }
            const { data: roleRow } = await supabase
                .from('role')
                .select('role_name')
                .eq('role_id', normalizedRoleId)
                .maybeSingle();
            normalizedRoleName = roleRow?.role_name ?? null;
            updates.role_id = normalizedRoleId;
        }
        if (normalizedDepartmentId !== undefined) {
            if (normalizedDepartmentId) {
                await this.validateDepartmentBelongsToCompany(supabase, { department_id: normalizedDepartmentId }, companyId);
            }
            updates.department_id = normalizedDepartmentId;
        }
        if (normalizedStartDate !== undefined) {
            updates.start_date = normalizedStartDate;
        }
        if (normalizedAccountStatus !== undefined) {
            if (!normalizedAccountStatus) {
                throw new common_1.BadRequestException('account_status cannot be empty.');
            }
            updates.account_status = normalizedAccountStatus;
        }
        const extendedFields = [
            'middle_name', 'personal_email', 'date_of_birth', 'place_of_birth',
            'nationality', 'civil_status', 'complete_address',
            'bank_name', 'bank_account_number', 'bank_account_name',
        ];
        for (const field of extendedFields) {
            if (dto[field] !== undefined) {
                updates[field] = dto[field] ?? null;
            }
        }
        if (updates.middle_name !== undefined) {
            updates.middle_name = (0, common_2.normalizeNamePart)(updates.middle_name);
        }
        if (Object.keys(updates).length === 0) {
            return { message: 'No fields to update' };
        }
        const { data: updatedUser, error: updateError } = await supabase
            .from('user_profile')
            .update(updates)
            .eq('user_id', id)
            .eq('company_id', companyId)
            .select('user_id, employee_id, username, first_name, middle_name, last_name, email, role_id, department_id, start_date, account_status, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, bank_name, bank_account_number, bank_account_name, avatar_url')
            .maybeSingle();
        if (updateError)
            throw new common_1.BadRequestException(updateError.message);
        if (!updatedUser)
            throw new common_1.NotFoundException('User not found in your company');
        if (normalizedDepartmentId !== undefined && updatedUser.employee_id) {
            try {
                const { data: updater } = await supabase
                    .from('user_profile')
                    .select('first_name, last_name')
                    .eq('user_id', adminUserId)
                    .maybeSingle();
                const updaterName = updater
                    ? `${updater.first_name ?? ''} ${updater.last_name ?? ''}`.trim() || null
                    : null;
                await this.timekeepingService.assignInitialScheduleForEmployee({
                    companyId,
                    employeeId: updatedUser.employee_id,
                    departmentId: normalizedDepartmentId || null,
                    effectiveDate: updatedUser.start_date ?? null,
                    updatedByName: updaterName,
                });
            }
            catch (scheduleError) {
                this.logger.warn(`Could not sync department schedule for user ${id}: ${scheduleError instanceof Error ? scheduleError.message : String(scheduleError)}`);
            }
        }
        if (roleIdsToAssign && roleIdsToAssign.length > 0) {
            await this.syncUserPortalAssignments({
                userId: id,
                companyId,
                roleId: normalizedRoleId,
                roleName: normalizedRoleName,
                setPrimary: true,
            });
            for (const extraRoleId of roleIdsToAssign.slice(1)) {
                const { data: extraRoleRow } = await supabase
                    .from('role')
                    .select('role_name')
                    .eq('role_id', extraRoleId)
                    .maybeSingle();
                await this.syncUserPortalAssignments({
                    userId: id,
                    companyId,
                    roleId: extraRoleId,
                    roleName: extraRoleRow?.role_name ?? null,
                    setPrimary: false,
                });
            }
        }
        const changes = Object.keys(updates)
            .map((field) => {
            const before = user[field] ?? null;
            const after = updates[field] ?? null;
            return `${field}: "${before}" -> "${after}"`;
        })
            .join(', ');
        await this.auditService.log(`User profile updated: ${user.email} - ${changes}`, adminUserId, companyId, id);
        const [lastLoginByUser, inviteExpiryByUser, assignmentsResult] = await Promise.all([
            this.getLastLoginMap([id]),
            this.getInviteExpiryMap([id]),
            supabase
                .from('user_role_assignments')
                .select('role_id')
                .eq('user_id', id)
                .eq('is_active', true),
        ]);
        return {
            ...updatedUser,
            role_ids: (assignmentsResult.data ?? []).map((a) => a.role_id),
            last_login: lastLoginByUser[id] ?? null,
            invite_expires_at: inviteExpiryByUser[id] ?? null,
        };
    }
    async remove(id, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error: findError } = await supabase
            .from('user_profile')
            .select('user_id, email')
            .eq('user_id', id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!user)
            throw new common_1.NotFoundException('User not found in your company');
        const { error: deactivateError } = await supabase
            .from('user_profile')
            .update({ account_status: 'Inactive' })
            .eq('user_id', id)
            .eq('company_id', companyId);
        if (deactivateError)
            throw new common_1.BadRequestException(deactivateError.message);
        await supabase
            .from('refresh_session')
            .update({ revoked_at: new Date().toISOString() })
            .eq('user_id', id)
            .is('revoked_at', null);
        await this.auditService.log(`User deactivated: ${user.email}`, adminUserId, companyId, id);
        return { message: 'User deactivated successfully' };
    }
    async assignCompanyEmail(userId, newEmail, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error: findError } = await supabase
            .from('user_profile')
            .select('user_id, email, personal_email')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!user)
            throw new common_1.NotFoundException('Employee not found in your company');
        const { data: taken } = await supabase
            .from('user_profile')
            .select('user_id')
            .eq('email', newEmail)
            .neq('user_id', userId)
            .maybeSingle();
        if (taken)
            throw new common_1.ConflictException('This email is already in use by another employee');
        await supabase.from('user_profile').update({ email: newEmail }).eq('user_id', userId);
        await supabase
            .from('refresh_session')
            .update({ revoked_at: new Date().toISOString() })
            .eq('user_id', userId)
            .is('revoked_at', null);
        await this.auditService.log(`Company email assigned: ${user.email} → ${newEmail}`, adminUserId, companyId, userId);
        return { message: 'Company email assigned successfully', email: newEmail };
    }
    async resendInvite(id, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error: findError } = await supabase
            .from('user_profile')
            .select('user_id, email, account_status, password_hash')
            .eq('user_id', id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!user)
            throw new common_1.NotFoundException('User not found in your company');
        if (user.account_status === 'Inactive')
            throw new common_1.BadRequestException('Cannot resend invite to a deactivated account.');
        if (user.password_hash)
            throw new common_1.BadRequestException('User has already activated their account.');
        await supabase
            .from('user_invites')
            .delete()
            .eq('user_id', id)
            .is('used_at', null);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: inviteError } = await supabase.from('user_invites').insert({
            invite_id: crypto.randomUUID(),
            user_id: id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (inviteError)
            throw new common_1.InternalServerErrorException(inviteError.message);
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const inviteLink = `${appUrl}/set-password?token=${rawToken}`;
        try {
            await this.mailService.sendInvite(user.email, inviteLink);
        }
        catch (emailError) {
            this.logger.warn(`[resendInvite] email error: ${emailError?.message ?? emailError}`);
            if (this.config.get('NODE_ENV') !== 'production') {
                this.logger.debug(`DEV MODE - invite link | Recipient: ${user.email} | Link: ${inviteLink}`);
            }
        }
        await this.auditService.log(`Invite resent to: ${user.email}`, adminUserId, companyId, id);
        return { message: `Invite resent to ${user.email}.`, invite_expires_at: expiresAt };
    }
    async reactivate(id, companyId, adminUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error: findError } = await supabase
            .from('user_profile')
            .select('user_id, email, account_status, password_hash')
            .eq('user_id', id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (findError)
            throw new common_1.BadRequestException(findError.message);
        if (!user)
            throw new common_1.NotFoundException('User not found in your company');
        if (user.account_status !== 'Inactive')
            throw new common_1.BadRequestException('User is not inactive');
        const nextStatus = user.password_hash ? 'Active' : 'Pending';
        const { error: updateError } = await supabase
            .from('user_profile')
            .update({ account_status: nextStatus })
            .eq('user_id', id)
            .eq('company_id', companyId);
        if (updateError)
            throw new common_1.BadRequestException(updateError.message);
        await this.auditService.log(`User reactivated: ${user.email} -> ${nextStatus}`, adminUserId, companyId, id);
        return { message: `User reactivated successfully as ${nextStatus}` };
    }
    async resolveOnboardingStaging(userId, userEmail) {
        const supabase = this.supabaseService.getClient();
        let { data: session } = await supabase
            .from('onboarding_sessions')
            .select('session_id')
            .eq('account_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!session) {
            const { data: applicant } = await supabase
                .from('applicant_profile')
                .select('applicant_id')
                .eq('email', userEmail)
                .eq('status', 'converted_employee')
                .maybeSingle();
            if (applicant) {
                const { data: fallback } = await supabase
                    .from('onboarding_sessions')
                    .select('session_id')
                    .eq('account_id', applicant.applicant_id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (fallback) {
                    session = fallback;
                    await supabase
                        .from('onboarding_sessions')
                        .update({ account_id: userId })
                        .eq('session_id', fallback.session_id);
                }
            }
        }
        if (!session)
            return null;
        const { data: staging } = await supabase
            .from('employee_staging')
            .select('*')
            .eq('session_id', session.session_id)
            .maybeSingle();
        return staging ?? null;
    }
    extractEmergencyContacts(staging) {
        if (!staging)
            return [];
        if (Array.isArray(staging.emergency_contacts) && staging.emergency_contacts.length > 0) {
            return staging.emergency_contacts;
        }
        if (staging.contact_name) {
            return [{
                    contact_name: staging.contact_name,
                    relationship: staging.relationship ?? '',
                    emergency_phone_number: staging.emergency_phone_number ?? '',
                    emergency_email_address: staging.emergency_email_address ?? null,
                }];
        }
        return [];
    }
    async getMe(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('user_profile')
            .select('user_id, employee_id, first_name, middle_name, last_name, email, username, department_id, department:department_id(department_name), start_date, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, bank_name, bank_account_number, bank_account_name, avatar_url, emergency_contacts')
            .eq('user_id', userId)
            .maybeSingle();
        if (error || !data)
            throw new common_1.NotFoundException('Profile not found');
        const patch = {};
        const staging = await this.resolveOnboardingStaging(userId, data.email);
        if (staging) {
            if (!data.middle_name && staging.middle_name)
                patch.middle_name = staging.middle_name;
            if (!data.personal_email && staging.email_address)
                patch.personal_email = staging.email_address;
            if (!data.date_of_birth && staging.date_of_birth)
                patch.date_of_birth = staging.date_of_birth;
            if (!data.place_of_birth && staging.place_of_birth)
                patch.place_of_birth = staging.place_of_birth;
            if (!data.nationality && staging.nationality)
                patch.nationality = staging.nationality;
            if (!data.civil_status && staging.civil_status)
                patch.civil_status = staging.civil_status;
            if (!data.complete_address && staging.complete_address)
                patch.complete_address = staging.complete_address;
            const storedContacts = Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [];
            if (storedContacts.length === 0) {
                const fromStaging = this.extractEmergencyContacts(staging);
                if (fromStaging.length > 0)
                    patch.emergency_contacts = fromStaging;
            }
        }
        if (Object.keys(patch).length > 0) {
            await supabase.from('user_profile').update(patch).eq('user_id', userId);
            Object.assign(data, patch);
        }
        const departmentRelation = data.department;
        const rawDepartmentName = Array.isArray(departmentRelation)
            ? departmentRelation[0]?.department_name
            : departmentRelation?.department_name;
        const department_name = typeof rawDepartmentName === 'string' && rawDepartmentName.trim()
            ? rawDepartmentName.trim()
            : null;
        return {
            ...data,
            department_name,
        };
    }
    async updateEmergencyContacts(userId, contacts) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('user_profile')
            .update({ emergency_contacts: contacts })
            .eq('user_id', userId);
        if (error)
            throw new common_1.InternalServerErrorException('Failed to update emergency contacts');
        try {
            const { data: userRow } = await supabase
                .from('user_profile').select('email').eq('user_id', userId).maybeSingle();
            if (userRow) {
                const staging = await this.resolveOnboardingStaging(userId, userRow.email);
                if (staging) {
                    const first = contacts[0];
                    await supabase.from('employee_staging').update({
                        emergency_contacts: contacts,
                        contact_name: first?.contact_name ?? '',
                        relationship: first?.relationship ?? '',
                        emergency_phone_number: first?.emergency_phone_number ?? '',
                        emergency_email_address: first?.emergency_email_address ?? null,
                    }).eq('session_id', staging.session_id);
                }
            }
        }
        catch {
        }
        return { message: 'Emergency contacts updated', emergency_contacts: contacts };
    }
    async updateMe(userId, body) {
        if (typeof body.avatar_url === 'string' &&
            body.avatar_url.length > 2_500_000) {
            throw new common_1.BadRequestException('Profile photo is too large. Please upload a smaller image.');
        }
        const allowed = ['middle_name', 'personal_email', 'date_of_birth', 'place_of_birth', 'nationality', 'civil_status', 'complete_address', 'bank_name', 'bank_account_number', 'bank_account_name', 'avatar_url', 'personal_notes'];
        const patch = {};
        for (const key of allowed) {
            if (body[key] !== undefined)
                patch[key] = body[key];
        }
        if (Object.keys(patch).length === 0)
            return { message: 'Nothing to update' };
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('user_profile')
            .update(patch)
            .eq('user_id', userId)
            .select('user_id, employee_id, first_name, middle_name, last_name, email, username, department_id, start_date, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, bank_name, bank_account_number, bank_account_name, avatar_url, personal_notes')
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException('Failed to update profile');
        return data;
    }
    async getOnboardingStaging(userId) {
        const supabase = this.supabaseService.getClient();
        const { data: session } = await supabase
            .from('onboarding_sessions')
            .select('session_id')
            .eq('account_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!session)
            throw new common_1.NotFoundException('No onboarding session found for this account.');
        const { data: staging } = await supabase
            .from('employee_staging')
            .select('first_name, last_name, middle_name, phone_number, complete_address, date_of_birth, place_of_birth, nationality, civil_status, email_address')
            .eq('session_id', session.session_id)
            .maybeSingle();
        if (!staging)
            throw new common_1.NotFoundException('No onboarding staging data found.');
        return {
            first_name: staging.first_name ?? null,
            last_name: staging.last_name ?? null,
            middle_name: staging.middle_name ?? null,
            phone_number: staging.phone_number ?? null,
            complete_address: staging.complete_address ?? null,
            date_of_birth: staging.date_of_birth ?? null,
            place_of_birth: staging.place_of_birth ?? null,
            nationality: staging.nationality ?? null,
            civil_status: staging.civil_status ?? null,
            personal_email: staging.email_address ?? null,
        };
    }
    async createEmployeeDocumentViewUrl(supabase, filePath, expiresInSeconds = 60 * 60 * 24 * 7) {
        if (!filePath)
            return null;
        if (filePath.startsWith('http'))
            return filePath;
        const { data } = await supabase.storage
            .from('employee-documents')
            .createSignedUrl(filePath, expiresInSeconds);
        return data?.signedUrl || filePath;
    }
    extractFileNameFromStoragePath(filePath) {
        if (!filePath)
            return null;
        const leaf = filePath.split('/').pop();
        if (!leaf)
            return null;
        const decoded = decodeURIComponent(leaf);
        return decoded.replace(/^proof_\d+_/, '').replace(/^\d+_/, '');
    }
    async getMyDocuments(userId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('employee_documents')
            .select('*')
            .eq('user_id', userId)
            .order('uploaded_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const docIds = (data || []).map((doc) => doc.id);
        const pendingReplacementDocIds = new Set();
        if (docIds.length > 0) {
            const { data: pendingReplacementRows, error: pendingReplacementError } = await supabase
                .from('document_replacement_requests')
                .select('document_id')
                .in('document_id', docIds)
                .eq('status', 'pending');
            if (pendingReplacementError) {
                throw new common_1.BadRequestException(pendingReplacementError.message);
            }
            for (const row of pendingReplacementRows || []) {
                if (row.document_id) {
                    pendingReplacementDocIds.add(row.document_id);
                }
            }
        }
        const withUrls = await Promise.all((data || []).map(async (doc) => {
            const fileUrl = await this.createEmployeeDocumentViewUrl(supabase, doc.file_path, 60 * 60 * 24 * 7);
            return {
                ...doc,
                file_url: fileUrl,
                pending_replacement_request: pendingReplacementDocIds.has(doc.id),
            };
        }));
        return withUrls;
    }
    async uploadEmployeeDocument(userId, docType, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded.');
        const allowed = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowed.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large. Maximum 5 MB.');
        }
        const supabase = this.supabaseService.getClient();
        const { data: existingDocsForType, error: existingDocsError } = await supabase
            .from('employee_documents')
            .select('id, status')
            .eq('user_id', userId)
            .eq('document_type', docType);
        if (existingDocsError)
            throw new common_1.BadRequestException(existingDocsError.message);
        const hasPendingDoc = (existingDocsForType || []).some((doc) => doc.status === 'pending');
        const hasApprovedDoc = (existingDocsForType || []).some((doc) => doc.status === 'approved');
        if (hasPendingDoc) {
            throw new common_1.ConflictException('This document is still pending review. You can upload again after HR/System Admin/Manager reviews it.');
        }
        if (hasApprovedDoc) {
            throw new common_1.BadRequestException('This document is already approved. Use the Replace action to submit a replacement request.');
        }
        const filePath = `${userId}/${docType}/${Date.now()}_${file.originalname}`;
        const { error: uploadErr } = await supabase.storage
            .from('employee-documents')
            .upload(filePath, file.buffer, { contentType: file.mimetype });
        if (uploadErr)
            throw new common_1.BadRequestException(`Upload failed: ${uploadErr.message}`);
        const { data: urlData } = await supabase.storage
            .from('employee-documents')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);
        const { data, error } = await supabase
            .from('employee_documents')
            .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            document_type: docType,
            file_path: filePath,
            file_name: file.originalname,
            file_size: file.size,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { ...data, file_url: urlData?.signedUrl || null };
    }
    async deleteEmployeeDocument(userId, docId) {
        const supabase = this.supabaseService.getClient();
        const { data: doc } = await supabase
            .from('employee_documents')
            .select('*')
            .eq('id', docId)
            .eq('user_id', userId)
            .maybeSingle();
        if (!doc)
            throw new common_1.NotFoundException('Document not found.');
        if (doc.status === 'approved') {
            throw new common_1.BadRequestException('Cannot delete an approved document.');
        }
        if (doc.status === 'pending') {
            throw new common_1.BadRequestException('Cannot delete a document that is pending review.');
        }
        if (doc.file_path && !doc.file_path.startsWith('http')) {
            await supabase.storage.from('employee-documents').remove([doc.file_path]);
        }
        const { error } = await supabase
            .from('employee_documents')
            .delete()
            .eq('id', docId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { message: 'Document deleted' };
    }
    async approveEmployeeDocument(docId, reviewerId) {
        const supabase = this.supabaseService.getClient();
        const reviewedAt = new Date().toISOString();
        const { data: pendingDoc, error: pendingDocError } = await supabase
            .from('employee_documents')
            .select('id, status, user_id')
            .eq('id', docId)
            .maybeSingle();
        if (pendingDocError)
            throw new common_1.BadRequestException(pendingDocError.message);
        if (pendingDoc) {
            if (pendingDoc.status !== 'pending') {
                throw new common_1.BadRequestException('This document has already been reviewed.');
            }
            if (String(pendingDoc.user_id ?? '') === reviewerId) {
                throw new common_1.ForbiddenException('You cannot review your own document request.');
            }
            const { error } = await supabase
                .from('employee_documents')
                .update({
                status: 'approved',
                reviewed_by: reviewerId,
                reviewed_at: reviewedAt,
                hr_notes: null,
            })
                .eq('id', docId);
            if (error)
                throw new common_1.BadRequestException(error.message);
            return { message: 'Document approved', id: docId };
        }
        const { data: replacementRequest, error: replacementError } = await supabase
            .from('document_replacement_requests')
            .select('id, document_id, employee_id, new_file_path, new_file_url, status')
            .eq('id', docId)
            .maybeSingle();
        if (replacementError)
            throw new common_1.BadRequestException(replacementError.message);
        if (!replacementRequest)
            throw new common_1.NotFoundException('Document not found.');
        if (replacementRequest.status !== 'pending') {
            throw new common_1.BadRequestException('This replacement request has already been reviewed.');
        }
        if (String(replacementRequest.employee_id ?? '') === reviewerId) {
            throw new common_1.ForbiddenException('You cannot review your own document replacement request.');
        }
        const replacementPath = replacementRequest.new_file_path || replacementRequest.new_file_url;
        if (!replacementPath) {
            throw new common_1.BadRequestException('Replacement request has no file to apply.');
        }
        const replacementFileName = this.extractFileNameFromStoragePath(replacementPath) || 'replacement-document';
        const { error: applyReplacementError } = await supabase
            .from('employee_documents')
            .update({
            file_path: replacementPath,
            file_name: replacementFileName,
            file_size: null,
            status: 'approved',
            reviewed_by: reviewerId,
            reviewed_at: reviewedAt,
            hr_notes: null,
            uploaded_at: reviewedAt,
        })
            .eq('id', replacementRequest.document_id);
        if (applyReplacementError)
            throw new common_1.BadRequestException(applyReplacementError.message);
        const { error: markReplacementError } = await supabase
            .from('document_replacement_requests')
            .update({
            status: 'approved',
            hr_notes: null,
            reviewed_by: reviewerId,
            reviewed_at: reviewedAt,
        })
            .eq('id', replacementRequest.id);
        if (markReplacementError)
            throw new common_1.BadRequestException(markReplacementError.message);
        return {
            message: 'Replacement request approved',
            id: replacementRequest.id,
            document_id: replacementRequest.document_id,
            is_replacement_request: true,
        };
    }
    async rejectEmployeeDocument(docId, reviewerId, hrNotes) {
        const supabase = this.supabaseService.getClient();
        const reviewedAt = new Date().toISOString();
        const { data: pendingDoc, error: pendingDocError } = await supabase
            .from('employee_documents')
            .select('id, status, user_id')
            .eq('id', docId)
            .maybeSingle();
        if (pendingDocError)
            throw new common_1.BadRequestException(pendingDocError.message);
        if (pendingDoc) {
            if (pendingDoc.status !== 'pending') {
                throw new common_1.BadRequestException('This document has already been reviewed.');
            }
            if (String(pendingDoc.user_id ?? '') === reviewerId) {
                throw new common_1.ForbiddenException('You cannot review your own document request.');
            }
            const { error } = await supabase
                .from('employee_documents')
                .update({
                status: 'rejected',
                reviewed_by: reviewerId,
                reviewed_at: reviewedAt,
                hr_notes: hrNotes,
            })
                .eq('id', docId);
            if (error)
                throw new common_1.BadRequestException(error.message);
            return { message: 'Document rejected', id: docId };
        }
        const { data: replacementRequest, error: replacementError } = await supabase
            .from('document_replacement_requests')
            .select('id, status, document_id, employee_id')
            .eq('id', docId)
            .maybeSingle();
        if (replacementError)
            throw new common_1.BadRequestException(replacementError.message);
        if (!replacementRequest)
            throw new common_1.NotFoundException('Document not found.');
        if (replacementRequest.status !== 'pending') {
            throw new common_1.BadRequestException('This replacement request has already been reviewed.');
        }
        if (String(replacementRequest.employee_id ?? '') === reviewerId) {
            throw new common_1.ForbiddenException('You cannot review your own document replacement request.');
        }
        const { error } = await supabase
            .from('document_replacement_requests')
            .update({
            status: 'rejected',
            reviewed_by: reviewerId,
            reviewed_at: reviewedAt,
            hr_notes: hrNotes,
        })
            .eq('id', docId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return {
            message: 'Replacement request rejected',
            id: replacementRequest.id,
            document_id: replacementRequest.document_id,
            is_replacement_request: true,
        };
    }
    async getPendingEmployeeDocuments(companyId) {
        const supabase = this.supabaseService.getClient();
        const { data: companyUsers, error: usersError } = await supabase
            .from('user_profile')
            .select('user_id, first_name, last_name, employee_id, avatar_url')
            .eq('company_id', companyId);
        if (usersError)
            throw new common_1.BadRequestException(usersError.message);
        const userIds = (companyUsers || []).map((u) => u.user_id);
        if (userIds.length === 0)
            return [];
        const profileByUserId = new Map((companyUsers || []).map((profile) => [profile.user_id, profile]));
        const { data: pendingDocs, error: pendingDocsError } = await supabase
            .from('employee_documents')
            .select('*')
            .in('user_id', userIds)
            .eq('status', 'pending')
            .order('uploaded_at', { ascending: true });
        if (pendingDocsError)
            throw new common_1.BadRequestException(pendingDocsError.message);
        const mappedPendingDocs = await Promise.all((pendingDocs || []).map(async (doc) => {
            const fileUrl = await this.createEmployeeDocumentViewUrl(supabase, doc.file_path, 60 * 60 * 24);
            return {
                ...doc,
                file_url: fileUrl,
                user_profile: profileByUserId.get(doc.user_id) ?? null,
                is_replacement_request: false,
                replacement_request_id: null,
                replacement_reason: null,
                original_document_id: doc.id,
            };
        }));
        const { data: pendingReplacementRequests, error: pendingReplacementError } = await supabase
            .from('document_replacement_requests')
            .select('id, document_id, employee_id, new_file_path, new_file_url, reason, created_at, status')
            .in('employee_id', userIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });
        if (pendingReplacementError)
            throw new common_1.BadRequestException(pendingReplacementError.message);
        const baseDocIds = [
            ...new Set((pendingReplacementRequests || []).map((row) => row.document_id)),
        ];
        let baseDocsById = new Map();
        if (baseDocIds.length > 0) {
            const { data: baseDocs, error: baseDocsError } = await supabase
                .from('employee_documents')
                .select('id, user_id, document_type, file_name')
                .in('id', baseDocIds);
            if (baseDocsError)
                throw new common_1.BadRequestException(baseDocsError.message);
            baseDocsById = new Map((baseDocs || []).map((doc) => [doc.id, doc]));
        }
        const mappedReplacementDocs = await Promise.all((pendingReplacementRequests || []).map(async (request) => {
            const baseDoc = baseDocsById.get(request.document_id);
            if (!baseDoc)
                return null;
            const replacementPath = request.new_file_path || request.new_file_url;
            const fileUrl = await this.createEmployeeDocumentViewUrl(supabase, replacementPath, 60 * 60 * 24);
            return {
                id: request.id,
                user_id: request.employee_id,
                document_type: baseDoc.document_type,
                file_path: replacementPath,
                file_name: this.extractFileNameFromStoragePath(replacementPath) ||
                    baseDoc.file_name ||
                    'Replacement document',
                file_size: null,
                status: 'pending',
                hr_notes: null,
                uploaded_at: request.created_at,
                reviewed_at: null,
                reviewed_by: null,
                file_url: fileUrl,
                user_profile: profileByUserId.get(request.employee_id) ?? null,
                is_replacement_request: true,
                replacement_request_id: request.id,
                replacement_reason: request.reason,
                original_document_id: request.document_id,
            };
        }));
        return [...mappedPendingDocs, ...mappedReplacementDocs.filter(Boolean)].sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
    }
    async submitDocumentReplacement(userId, docId, reason, file, proofFile) {
        const supabase = this.supabaseService.getClient();
        const { data: doc, error: docErr } = await supabase
            .from('employee_documents')
            .select('id, user_id, status, document_type')
            .eq('id', docId)
            .eq('user_id', userId)
            .maybeSingle();
        if (docErr)
            throw new common_1.InternalServerErrorException(docErr.message);
        if (!doc)
            throw new common_1.NotFoundException('Document not found.');
        if (doc.status !== 'approved')
            throw new common_1.BadRequestException('Only approved documents can be replaced.');
        const { data: existing } = await supabase
            .from('document_replacement_requests')
            .select('id')
            .eq('document_id', docId)
            .eq('status', 'pending')
            .maybeSingle();
        if (existing)
            throw new common_1.ConflictException('A replacement request is already pending for this document.');
        const filePath = `${userId}/replacements/${Date.now()}_${file.originalname}`;
        const { error: uploadErr } = await supabase.storage
            .from('employee-documents')
            .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
        if (uploadErr)
            throw new common_1.InternalServerErrorException(`File upload failed: ${uploadErr.message}`);
        const { data: urlData } = supabase.storage.from('employee-documents').getPublicUrl(filePath);
        const newFileUrl = urlData.publicUrl;
        let proofUrl = null;
        if (proofFile) {
            const proofPath = `${userId}/replacements/proof_${Date.now()}_${proofFile.originalname}`;
            const { error: proofUploadErr } = await supabase.storage
                .from('employee-documents')
                .upload(proofPath, proofFile.buffer, { contentType: proofFile.mimetype, upsert: false });
            if (!proofUploadErr) {
                proofUrl = supabase.storage.from('employee-documents').getPublicUrl(proofPath).data.publicUrl;
            }
        }
        const { data: request, error: insertErr } = await supabase
            .from('document_replacement_requests')
            .insert({
            id: crypto.randomUUID(),
            document_id: docId,
            employee_id: userId,
            new_file_url: newFileUrl,
            new_file_path: filePath,
            reason,
            proof_url: proofUrl,
            status: 'pending',
            created_at: new Date().toISOString(),
        })
            .select('id, status')
            .single();
        if (insertErr)
            throw new common_1.InternalServerErrorException(insertErr.message);
        return { replacement_request_id: request.id, status: 'pending' };
    }
    async submitChangeRequest(employeeId, companyId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingPending, error: existingPendingError } = await supabase
            .from('profile_change_requests')
            .select('request_id')
            .eq('employee_id', employeeId)
            .eq('field_type', dto.field_type)
            .eq('status', 'pending')
            .maybeSingle();
        if (existingPendingError)
            throw new common_1.BadRequestException(existingPendingError.message);
        if (existingPending) {
            const fieldLabel = dto.field_type === 'legal_name' ? 'legal name' : 'bank account';
            throw new common_1.ConflictException(`You already have a pending ${fieldLabel} change request.`);
        }
        const { data, error } = await supabase
            .from('profile_change_requests')
            .insert({
            employee_id: employeeId,
            company_id: companyId,
            field_type: dto.field_type,
            requested_changes: dto.requested_changes,
            reason: dto.reason,
            supporting_doc_url: dto.supporting_doc_url ?? null,
            status: 'pending',
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        const fieldLabel = dto.field_type === 'legal_name' ? 'Legal Name' : 'Bank Account';
        this.notificationsService.notifyAllHRInCompany(companyId, {
            type: 'PROFILE_CHANGE_SUBMITTED',
            title: 'Profile Change Request',
            message: `An employee has submitted a ${fieldLabel} change request for review.`,
            metadata: { request_id: data.request_id, employee_id: employeeId, field_type: dto.field_type },
        }).catch(() => { });
        this.auditService.log(`PROFILE_CHANGE_REQUEST_SUBMITTED: ${dto.field_type}`, employeeId, companyId).catch(() => { });
        return data;
    }
    async getMyChangeRequests(employeeId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('profile_change_requests')
            .select('*')
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async getChangeRequestsForCompany(companyId, status) {
        let query = this.supabaseService
            .getClient()
            .from('profile_change_requests')
            .select('*, employee:employee_id(first_name, last_name, employee_id, email, avatar_url)')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async reviewChangeRequest(requestId, reviewerId, companyId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data: request, error: fetchErr } = await supabase
            .from('profile_change_requests')
            .select('*, employee:employee_id(first_name, last_name, email)')
            .eq('request_id', requestId)
            .eq('company_id', companyId)
            .single();
        if (fetchErr || !request)
            throw new common_1.NotFoundException('Change request not found.');
        if (request.status !== 'pending')
            throw new common_1.BadRequestException('This request has already been reviewed.');
        if (String(request.employee_id ?? '') === reviewerId) {
            throw new common_1.ForbiddenException('You cannot review your own profile change request.');
        }
        const { data: updated, error: updateErr } = await supabase
            .from('profile_change_requests')
            .update({
            status: dto.status,
            reviewed_by: reviewerId,
            review_reason: dto.review_reason,
            reviewed_at: new Date().toISOString(),
        })
            .eq('request_id', requestId)
            .select()
            .single();
        if (updateErr)
            throw new common_1.BadRequestException(updateErr.message);
        if (dto.status === 'approved') {
            const changes = request.requested_changes;
            if (request.field_type === 'legal_name') {
                const nameUpdate = {};
                const firstName = (0, common_2.normalizeNamePart)(changes.first_name);
                const middleName = (0, common_2.normalizeNamePart)(changes.middle_name);
                const lastName = (0, common_2.normalizeNamePart)(changes.last_name);
                if (firstName)
                    nameUpdate.first_name = firstName;
                if (middleName !== undefined)
                    nameUpdate.middle_name = middleName ?? '';
                if (lastName)
                    nameUpdate.last_name = lastName;
                if (Object.keys(nameUpdate).length > 0) {
                    await supabase.from('user_profile').update(nameUpdate).eq('user_id', request.employee_id);
                }
            }
            else if (request.field_type === 'bank') {
                const bankUpdate = {};
                if (changes.bank_name)
                    bankUpdate.bank_name = changes.bank_name;
                if (changes.bank_account_number)
                    bankUpdate.bank_account_number = changes.bank_account_number;
                if (changes.bank_account_name)
                    bankUpdate.bank_account_name = changes.bank_account_name;
                if (Object.keys(bankUpdate).length > 0) {
                    await supabase.from('user_profile').update(bankUpdate).eq('user_id', request.employee_id);
                }
            }
        }
        const employee = request.employee;
        const fieldLabel = request.field_type === 'legal_name' ? 'Legal Name' : 'Bank Account';
        this.notificationsService.createNotification({
            userId: request.employee_id,
            companyId,
            type: 'PROFILE_CHANGE_REVIEWED',
            title: dto.status === 'approved' ? `${fieldLabel} Change Approved` : `${fieldLabel} Change Rejected`,
            message: dto.status === 'approved'
                ? `Your ${fieldLabel} change request has been approved.`
                : `Your ${fieldLabel} change request was rejected. Reason: ${dto.review_reason}`,
            metadata: { request_id: requestId, field_type: request.field_type, status: dto.status },
        }).catch(() => { });
        if (employee?.email) {
            this.mailService.sendProfileChangeReviewedEmail({
                to: employee.email,
                employeeName: `${employee.first_name} ${employee.last_name}`,
                fieldType: request.field_type,
                status: dto.status,
                reviewReason: dto.review_reason,
            }).catch(() => { });
        }
        this.auditService.log(`PROFILE_CHANGE_REQUEST_REVIEWED (${dto.status}): ${request.field_type}`, reviewerId, companyId, request.employee_id).catch(() => { });
        return updated;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        timekeeping_service_1.TimekeepingService])
], UsersService);
//# sourceMappingURL=users.service.js.map