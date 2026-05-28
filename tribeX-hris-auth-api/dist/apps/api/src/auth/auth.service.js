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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
const mail_service_1 = require("../mail/mail.service");
const EMPLOYEE_PORTAL_ELIGIBLE_ROLES = new Set([
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
function normalizePortalKey(value) {
    const cleaned = String(value ?? '').trim().toLowerCase();
    return cleaned || 'employee';
}
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
function normalizeRoleName(roleName) {
    return String(roleName ?? '').trim().toLowerCase();
}
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
function getIp(req) {
    if (!req)
        return null;
    const xf = req.headers?.['x-forwarded-for'];
    if (typeof xf === 'string' && xf.length)
        return xf.split(',')[0].trim();
    return req.ip || req.socket?.remoteAddress || null;
}
function getBrowser(req) {
    if (!req)
        return null;
    return req.headers?.['user-agent'] || null;
}
let AuthService = AuthService_1 = class AuthService {
    supabaseService;
    jwtService;
    config;
    mailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(supabaseService, jwtService, config, mailService) {
        this.supabaseService = supabaseService;
        this.jwtService = jwtService;
        this.config = config;
        this.mailService = mailService;
    }
    async writeIncidentLog(action, severity, options) {
        try {
            await this.supabaseService.getClient().from('admin_audit_logs').insert({
                action,
                performed_by: options?.userId ?? null,
                company_id: options?.companyId ?? null,
                target_user_id: null,
                severity,
                ip_address: options?.ipAddress ?? null,
            });
        }
        catch {
        }
    }
    logDevLink(label, recipient, link) {
        if (this.config.get('NODE_ENV') === 'production')
            return;
        this.logger.debug(`DEV MODE - ${label} | Recipient: ${recipient} | Link: ${link}`);
    }
    async getAssignedRoles(user, options) {
        const supabase = this.supabaseService.getClient();
        const userId = String(options?.userId ?? '').trim();
        const companyId = String(options?.companyId ?? '').trim();
        if (userId && companyId) {
            await this.ensureEmployeeRoleAssignment(userId, companyId);
        }
        const requestedRoleId = String(options?.requestedRoleId ?? '').trim() || null;
        const fallbackRoleId = String(user.role_id ?? '').trim();
        const targetRoleId = requestedRoleId ?? fallbackRoleId;
        if (!targetRoleId) {
            throw new common_1.UnauthorizedException('Role not found');
        }
        let assignments = [];
        if (userId) {
            const { data: assignmentRows, error: assignmentsError } = await supabase
                .from('user_role_assignments')
                .select('role_id, is_primary')
                .eq('user_id', userId)
                .eq('is_active', true);
            if (assignmentsError) {
                throw new common_1.UnauthorizedException('Role lookup failed');
            }
            const roleIds = [...new Set((assignmentRows ?? []).map((row) => String(row.role_id ?? '').trim()).filter(Boolean))];
            if (roleIds.length) {
                const { data: roleRows } = await supabase
                    .from('role')
                    .select('role_id, role_name')
                    .in('role_id', roleIds);
                const roleNameById = new Map((roleRows ?? []).map((role) => [String(role.role_id), String(role.role_name ?? '').trim()]));
                assignments = (assignmentRows ?? [])
                    .map((row) => {
                    const roleId = String(row.role_id ?? '').trim();
                    const roleName = roleNameById.get(roleId) ?? '';
                    if (!roleId || !roleName)
                        return null;
                    return {
                        role_id: roleId,
                        role_name: roleName,
                        is_primary: !!row.is_primary,
                        portal_key: roleNameToPortal(roleName),
                    };
                })
                    .filter(Boolean);
            }
        }
        if (!assignments.length) {
            const { data: roleRow, error: roleError } = await supabase
                .from('role')
                .select('role_id, role_name')
                .eq('role_id', targetRoleId)
                .maybeSingle();
            if (roleError || !roleRow?.role_id || !roleRow?.role_name) {
                throw new common_1.UnauthorizedException('Role not found');
            }
            assignments = [
                {
                    role_id: String(roleRow.role_id),
                    role_name: String(roleRow.role_name).trim(),
                    is_primary: true,
                    portal_key: roleNameToPortal(roleRow.role_name),
                },
            ];
            if (userId) {
                await supabase.from('user_role_assignments').upsert({
                    user_id: userId,
                    role_id: String(roleRow.role_id),
                    is_primary: true,
                    is_active: true,
                }, { onConflict: 'user_id,role_id' });
                await supabase
                    .from('role_portal_map')
                    .upsert({
                    role_id: String(roleRow.role_id),
                    portal_key: roleNameToPortal(roleRow.role_name),
                }, { onConflict: 'role_id,portal_key' });
            }
        }
        assignments = await this.enforceSystemAdminSinglePortal(userId, assignments);
        const explicitActive = assignments.find((role) => role.role_id === targetRoleId);
        if (requestedRoleId && !explicitActive) {
            throw new common_1.UnauthorizedException('Role not assigned to this account');
        }
        const active = explicitActive ?? assignments.find((role) => role.is_primary) ?? assignments[0];
        if (!active) {
            throw new common_1.UnauthorizedException('Role not found');
        }
        const roleNames = [...new Set(assignments.map((role) => role.role_name))];
        const roleIds = [...new Set(assignments.map((role) => role.role_id))];
        const availablePortals = [...new Set(assignments.map((role) => role.portal_key))];
        return {
            activeRoleId: active.role_id,
            activeRoleName: active.role_name,
            activePortal: active.portal_key,
            roleNames,
            roleIds,
            availablePortals,
            switchOptions: assignments.map((role) => ({
                role_id: role.role_id,
                role_name: role.role_name,
                portal_key: role.portal_key,
            })),
        };
    }
    async enforceSystemAdminSinglePortal(userId, assignments) {
        const systemAdminAssignments = assignments.filter((role) => normalizeRoleName(role.role_name) === 'system admin');
        if (systemAdminAssignments.length === 0) {
            return assignments;
        }
        const keptAssignment = systemAdminAssignments.find((role) => role.is_primary)
            ?? systemAdminAssignments[0];
        if (!keptAssignment) {
            return assignments;
        }
        if (userId && assignments.length > 1) {
            const supabase = this.supabaseService.getClient();
            const staleRoleIds = assignments
                .filter((role) => role.role_id !== keptAssignment.role_id)
                .map((role) => role.role_id);
            if (staleRoleIds.length > 0) {
                await supabase
                    .from('user_role_assignments')
                    .update({ is_active: false, is_primary: false })
                    .eq('user_id', userId)
                    .in('role_id', staleRoleIds);
            }
            await supabase
                .from('user_role_assignments')
                .update({ is_active: true, is_primary: true })
                .eq('user_id', userId)
                .eq('role_id', keptAssignment.role_id);
        }
        return [
            {
                ...keptAssignment,
                is_primary: true,
                portal_key: 'system-admin',
            },
        ];
    }
    async ensureEmployeeRoleAssignment(userId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data: activeRoles, error: activeRolesError } = await supabase
            .from('user_role_assignments')
            .select('role_id')
            .eq('user_id', userId)
            .eq('is_active', true);
        if (activeRolesError)
            return;
        const roleIds = [...new Set((activeRoles ?? []).map((entry) => String(entry.role_id ?? '').trim()).filter(Boolean))];
        if (!roleIds.length) {
            const { data: userRow } = await supabase
                .from('user_profile')
                .select('role_id')
                .eq('user_id', userId)
                .maybeSingle();
            const fallbackRoleId = String(userRow?.role_id ?? '').trim();
            if (!fallbackRoleId)
                return;
            await supabase.from('user_role_assignments').upsert({
                user_id: userId,
                role_id: fallbackRoleId,
                is_primary: true,
                is_active: true,
            }, { onConflict: 'user_id,role_id' });
            roleIds.push(fallbackRoleId);
        }
        const { data: roleRows, error: roleRowsError } = await supabase
            .from('role')
            .select('role_name')
            .in('role_id', roleIds);
        if (roleRowsError)
            return;
        const roleNames = (roleRows ?? [])
            .map((entry) => normalizeRoleName(entry.role_name))
            .filter(Boolean);
        if (!roleNames.length)
            return;
        if (roleNames.includes('system admin')) {
            return;
        }
        if (roleNames.some((roleName) => roleName === 'active employee' || roleName === 'employee')) {
            return;
        }
        if (!roleNames.some((roleName) => EMPLOYEE_PORTAL_ELIGIBLE_ROLES.has(roleName))) {
            return;
        }
        const { data: employeeRole } = await supabase
            .from('role')
            .select('role_id')
            .eq('company_id', companyId)
            .in('role_name', ['Active Employee', 'Employee'])
            .order('role_name', { ascending: true })
            .maybeSingle();
        if (!employeeRole?.role_id)
            return;
        await supabase.from('user_role_assignments').upsert({
            user_id: userId,
            role_id: String(employeeRole.role_id),
            is_active: true,
            is_primary: false,
        }, { onConflict: 'user_id,role_id' });
        await supabase
            .from('role_portal_map')
            .upsert({ role_id: String(employeeRole.role_id), portal_key: 'employee' }, { onConflict: 'role_id,portal_key' });
    }
    buildAccessPayload(input) {
        return {
            type: 'access',
            sub_userid: input.user.user_id,
            company_id: input.user.company_id,
            role_id: input.activeRoleId,
            role_name: input.activeRoleName,
            roles: input.roleNames,
            role_ids: input.roleIds,
            available_portals: input.availablePortals,
            active_portal: input.activePortal,
            role_switch_options: input.switchOptions,
            company_name: input.companyName,
            first_name: input.user.first_name,
            last_name: input.user.last_name,
        };
    }
    async issueFreshUserInvite(userId) {
        const supabase = this.supabaseService.getClient();
        await supabase
            .from('user_invites')
            .delete()
            .eq('user_id', userId)
            .is('used_at', null);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = sha256(rawToken);
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: inviteError } = await supabase.from('user_invites').insert({
            invite_id: crypto.randomUUID(),
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (inviteError) {
            throw new Error(inviteError.message);
        }
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        return `${appUrl}/set-password?token=${rawToken}`;
    }
    async resendActivationInvite(user) {
        const inviteLink = await this.issueFreshUserInvite(user.user_id);
        this.logDevLink('activation link', user.email, inviteLink);
        try {
            await this.mailService.sendInvite(user.email, inviteLink);
        }
        catch (error) {
            this.logger.error(`Failed to resend activation email to ${user.email}`, error);
            void this.writeIncidentLog(`EMAIL: Failed to send activation invite to ${user.email}`, 'ERROR', { userId: user.user_id });
            throw error;
        }
    }
    async requestPasswordReset(dto) {
        const supabase = this.supabaseService.getClient();
        const email = dto.email.trim().toLowerCase();
        const { data: user, error } = await supabase
            .from('user_profile')
            .select('user_id, company_id, role_id, password_hash, email, username, first_name, last_name, start_date, account_status')
            .eq('email', email)
            .maybeSingle();
        if (error) {
            this.logger.error(`DB error during forgot-password for: ${email}`, error);
            return {
                message: 'If an account exists for that email, a reset link has been sent.',
            };
        }
        if (!user || user.account_status === 'Inactive') {
            return {
                message: 'If an account exists for that email, a reset link has been sent.',
            };
        }
        try {
            const resetLink = await this.issueFreshUserInvite(user.user_id);
            this.logDevLink('password reset link', user.email, resetLink);
            await this.mailService.sendPasswordResetEmail(user.email, resetLink);
        }
        catch (resetError) {
            this.logger.error(`Failed to process forgot-password for ${email}`, resetError);
            void this.writeIncidentLog(`EMAIL: Failed to send password reset email to ${email}`, 'ERROR', { userId: user.user_id });
        }
        return {
            message: 'If an account exists for that email, a reset link has been sent.',
        };
    }
    async login(loginDto, req) {
        const supabase = this.supabaseService.getClient();
        const { identifier, password } = loginDto;
        const rememberMe = !!loginDto.rememberMe;
        if (!/^[a-zA-Z0-9._@-]+$/.test(identifier)) {
            throw new common_1.UnauthorizedException('Invalid identifier format');
        }
        const { data: user, error } = await supabase
            .from('user_profile')
            .select('user_id, company_id, role_id, password_hash, email, username, first_name, last_name, start_date, account_status')
            .or(`email.eq.${identifier},username.eq.${identifier}`)
            .maybeSingle();
        if (error) {
            this.logger.error(`DB error during login for: ${identifier}`, error);
            throw new common_1.UnauthorizedException('Login failed');
        }
        if (!user)
            throw new common_1.UnauthorizedException('No account found with that email or username.');
        if (user.account_status === 'Inactive') {
            void this.writeIncidentLog(`SECURITY: Login blocked for ${user.email} — account deactivated`, 'WARNING', { userId: user.user_id, companyId: user.company_id, ipAddress: getIp(req) ?? undefined });
            throw new common_1.UnauthorizedException('Your account has been deactivated. Please contact your administrator.');
        }
        if (!user.password_hash)
            throw new common_1.UnauthorizedException('No password set');
        if (user.start_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(user.start_date);
            startDate.setHours(0, 0, 0, 0);
            if (today < startDate) {
                void this.writeIncidentLog(`SECURITY: Login blocked for ${user.email} — account not yet active (start date: ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})`, 'WARNING', { userId: user.user_id, companyId: user.company_id, ipAddress: getIp(req) ?? undefined });
                throw new common_1.UnauthorizedException(`Your account is not active yet. Your start date is ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`);
            }
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            await Promise.all([
                supabase.from('login_history').insert({
                    login_id: crypto.randomUUID(),
                    role_id: String(user.role_id),
                    user_id: user.user_id,
                    ip_address: getIp(req),
                    browser_info: getBrowser(req),
                    status: 'FAILED',
                }),
                this.writeIncidentLog(`SECURITY: Failed login attempt for ${user.email} — incorrect password`, 'WARNING', { userId: user.user_id, companyId: user.company_id, ipAddress: getIp(req) ?? undefined }),
            ]);
            throw new common_1.UnauthorizedException('Incorrect password. Please try again.');
        }
        const { data: reg } = await supabase
            .from('company_registrations')
            .select('subscription_status')
            .eq('company_id', user.company_id)
            .maybeSingle();
        if (reg?.subscription_status === 'Suspended') {
            throw new common_1.UnauthorizedException('Your company subscription has been suspended. Contact support.');
        }
        if (reg?.subscription_status === 'Expired') {
            throw new common_1.UnauthorizedException('Your company subscription has expired. Please renew to continue.');
        }
        const { data: companydb, error: companyError } = await supabase
            .from('company')
            .select('company_name')
            .eq('company_id', user.company_id)
            .single();
        if (companyError || !companydb)
            throw new common_1.UnauthorizedException('Company not found');
        const assignedRoles = await this.getAssignedRoles(user, {
            userId: user.user_id,
            companyId: user.company_id,
        });
        const login_id = crypto.randomUUID();
        const session_id = crypto.randomUUID();
        const accessPayload = this.buildAccessPayload({
            user,
            activeRoleId: assignedRoles.activeRoleId,
            activeRoleName: assignedRoles.activeRoleName,
            roleNames: assignedRoles.roleNames,
            roleIds: assignedRoles.roleIds,
            availablePortals: assignedRoles.availablePortals,
            activePortal: assignedRoles.activePortal,
            switchOptions: assignedRoles.switchOptions,
            companyName: companydb.company_name,
        });
        const refreshMaxAgeMs = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;
        const refreshExpiresIn = Math.floor(refreshMaxAgeMs / 1000);
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(accessPayload, { expiresIn: '15m' }),
            this.jwtService.signAsync({
                type: 'refresh',
                sub_userid: user.user_id,
                role_id: assignedRoles.activeRoleId,
                role_ids: assignedRoles.roleIds,
                roles: assignedRoles.roleNames,
                available_portals: assignedRoles.availablePortals,
                active_portal: assignedRoles.activePortal,
                role_switch_options: assignedRoles.switchOptions,
                login_id,
                session_id,
            }, { expiresIn: refreshExpiresIn }),
        ]);
        const decoded = this.jwtService.decode(refresh_token);
        const expires_at = new Date(decoded.exp * 1000).toISOString();
        const token_hash = sha256(refresh_token);
        await Promise.all([
            supabase.from('login_history').insert({
                login_id,
                role_id: assignedRoles.activeRoleId,
                user_id: user.user_id,
                ip_address: getIp(req),
                browser_info: getBrowser(req),
                status: 'SUCCESS',
            }),
            supabase.from('refresh_session').insert({
                user_id: user.user_id,
                token_hash,
                expires_at,
            }),
        ]);
        return {
            access_token,
            refresh_token,
            refresh_max_age_ms: refreshMaxAgeMs,
            roles: assignedRoles.roleNames,
            active_role: assignedRoles.activeRoleName,
            active_portal: assignedRoles.activePortal,
            available_portals: assignedRoles.availablePortals,
            role_switch_options: assignedRoles.switchOptions,
            requires_portal_selection: assignedRoles.availablePortals.length > 1,
        };
    }
    async logout(refreshToken, req, accessToken) {
        const supabase = this.supabaseService.getClient();
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const token_hash = sha256(refreshToken);
        await supabase
            .from('refresh_session')
            .update({ revoked_at: new Date().toISOString() })
            .eq('user_id', decoded.sub_userid)
            .eq('token_hash', token_hash);
        if (accessToken) {
            try {
                const accessDecoded = await this.jwtService.verifyAsync(accessToken);
                if (accessDecoded?.exp) {
                    await supabase.from('token_blacklist').insert({
                        token_hash: sha256(accessToken),
                        expires_at: new Date(accessDecoded.exp * 1000).toISOString(),
                    });
                }
            }
            catch {
            }
        }
        await supabase.from('logout_history').insert({
            logout_id: crypto.randomUUID(),
            login_id: decoded.login_id ?? null,
            role_id: decoded.role_id == null ? null : String(decoded.role_id),
            user_id: decoded.sub_userid ?? null,
            session_id: decoded.session_id ?? token_hash,
            ip_address: getIp(req),
            browser_info: getBrowser(req),
        });
        const { data: user, error } = await supabase
            .from('user_profile')
            .select('username')
            .eq('user_id', decoded.sub_userid)
            .single();
        if (error || !user)
            throw new common_1.UnauthorizedException('User not found');
        return { message: 'Logged out', username: user.username };
    }
    async refresh(refreshToken) {
        const supabase = this.supabaseService.getClient();
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (decoded.type !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid refresh token type');
        const userId = decoded.sub_userid;
        const token_hash = sha256(refreshToken);
        const { data: session, error } = await supabase
            .from('refresh_session')
            .select('expires_at, revoked_at')
            .eq('user_id', userId)
            .eq('token_hash', token_hash)
            .maybeSingle();
        if (error || !session)
            throw new common_1.UnauthorizedException('Session not found');
        if (session.revoked_at)
            throw new common_1.UnauthorizedException('Session revoked');
        if (new Date(session.expires_at) <= new Date())
            throw new common_1.UnauthorizedException('Session expired');
        const { data: user, error: userErr } = await supabase
            .from('user_profile')
            .select('user_id, company_id, role_id, first_name, last_name, account_status')
            .eq('user_id', userId)
            .single();
        if (userErr || !user)
            throw new common_1.UnauthorizedException('User not found');
        if (user.account_status === 'Inactive')
            throw new common_1.UnauthorizedException('Account deactivated');
        const { data: companydb, error: companyErr } = await supabase
            .from('company')
            .select('company_name')
            .eq('company_id', user.company_id)
            .single();
        if (companyErr || !companydb)
            throw new common_1.UnauthorizedException('Company not found');
        const assignedRoles = await this.getAssignedRoles(user, {
            userId: user.user_id,
            companyId: user.company_id,
            requestedRoleId: decoded.role_id,
        });
        const accessPayload = this.buildAccessPayload({
            user,
            activeRoleId: assignedRoles.activeRoleId,
            activeRoleName: assignedRoles.activeRoleName,
            roleNames: assignedRoles.roleNames,
            roleIds: assignedRoles.roleIds,
            availablePortals: assignedRoles.availablePortals,
            activePortal: assignedRoles.activePortal,
            switchOptions: assignedRoles.switchOptions,
            companyName: companydb.company_name,
        });
        const access_token = await this.jwtService.signAsync(accessPayload, {
            expiresIn: '15m',
        });
        const refreshRemainingMs = new Date(session.expires_at).getTime() - Date.now();
        if (refreshRemainingMs <= 0) {
            throw new common_1.UnauthorizedException('Session expired');
        }
        const rotatedRefreshToken = await this.jwtService.signAsync({
            type: 'refresh',
            sub_userid: user.user_id,
            role_id: assignedRoles.activeRoleId,
            role_ids: assignedRoles.roleIds,
            roles: assignedRoles.roleNames,
            available_portals: assignedRoles.availablePortals,
            active_portal: assignedRoles.activePortal,
            role_switch_options: assignedRoles.switchOptions,
            login_id: decoded.login_id ?? crypto.randomUUID(),
            session_id: decoded.session_id ?? crypto.randomUUID(),
        }, { expiresIn: Math.max(1, Math.floor(refreshRemainingMs / 1000)) });
        const { data: rotatedSession, error: rotateErr } = await supabase
            .from('refresh_session')
            .update({ token_hash: sha256(rotatedRefreshToken) })
            .eq('user_id', userId)
            .eq('token_hash', token_hash)
            .is('revoked_at', null)
            .select('user_id')
            .maybeSingle();
        if (rotateErr || !rotatedSession) {
            throw new common_1.UnauthorizedException('Failed to rotate session');
        }
        return {
            access_token,
            refresh_token: rotatedRefreshToken,
            refresh_max_age_ms: refreshRemainingMs,
        };
    }
    async me(accessToken) {
        try {
            const decoded = await this.jwtService.verifyAsync(accessToken);
            if (decoded.type !== 'access')
                throw new common_1.UnauthorizedException('Invalid token type');
            const supabase = this.supabaseService.getClient();
            const { data: blacklisted } = await supabase
                .from('token_blacklist')
                .select('token_hash')
                .eq('token_hash', sha256(accessToken))
                .maybeSingle();
            if (blacklisted)
                throw new common_1.UnauthorizedException('Token has been revoked');
            const userId = decoded.sub_userid;
            if (!userId)
                throw new common_1.UnauthorizedException('Invalid token payload');
            const { data: user, error } = await supabase
                .from('user_profile')
                .select('user_id, email, username, employee_id, company_id, role_id, first_name, last_name, account_status')
                .eq('user_id', userId)
                .maybeSingle();
            if (error || !user)
                throw new common_1.UnauthorizedException('User not found');
            if (user.account_status === 'Inactive')
                throw new common_1.UnauthorizedException('Account deactivated');
            const assignedRoles = await this.getAssignedRoles(user, {
                userId: user.user_id,
                companyId: user.company_id,
                requestedRoleId: typeof decoded.role_id === 'string' ? decoded.role_id : null,
            });
            return {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                employee_id: user.employee_id,
                company_id: user.company_id,
                role_id: assignedRoles.activeRoleId,
                role_name: assignedRoles.activeRoleName,
                role_ids: assignedRoles.roleIds,
                active_portal: assignedRoles.activePortal,
                available_portals: assignedRoles.availablePortals,
                role_switch_options: assignedRoles.switchOptions,
                roles: assignedRoles.roleNames,
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async switchRole(userId, companyId, requestedRoleId) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error } = await supabase
            .from('user_profile')
            .select('user_id, company_id, role_id, first_name, last_name, account_status')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (error || !user)
            throw new common_1.UnauthorizedException('User not found');
        if (user.account_status === 'Inactive') {
            throw new common_1.UnauthorizedException('Account deactivated');
        }
        const { data: companydb, error: companyErr } = await supabase
            .from('company')
            .select('company_name')
            .eq('company_id', companyId)
            .single();
        if (companyErr || !companydb) {
            throw new common_1.UnauthorizedException('Company not found');
        }
        const assignedRoles = await this.getAssignedRoles(user, {
            userId: user.user_id,
            companyId: user.company_id,
            requestedRoleId,
        });
        const accessPayload = this.buildAccessPayload({
            user,
            activeRoleId: assignedRoles.activeRoleId,
            activeRoleName: assignedRoles.activeRoleName,
            roleNames: assignedRoles.roleNames,
            roleIds: assignedRoles.roleIds,
            availablePortals: assignedRoles.availablePortals,
            activePortal: assignedRoles.activePortal,
            switchOptions: assignedRoles.switchOptions,
            companyName: companydb.company_name,
        });
        return {
            access_token: await this.jwtService.signAsync(accessPayload, {
                expiresIn: '15m',
            }),
            roles: assignedRoles.roleNames,
            active_role: assignedRoles.activeRoleName,
            active_portal: assignedRoles.activePortal,
            available_portals: assignedRoles.availablePortals,
            role_switch_options: assignedRoles.switchOptions,
            requires_portal_selection: assignedRoles.availablePortals.length > 1,
        };
    }
    async setPassword(token, password) {
        const supabase = this.supabaseService.getClient();
        const tokenHash = sha256(token);
        const { data: invite, error: inviteError } = await supabase
            .from('user_invites')
            .select('invite_id, user_id, expires_at, used_at')
            .eq('token_hash', tokenHash)
            .maybeSingle();
        if (inviteError || !invite)
            throw new common_1.UnauthorizedException('Invalid or expired invite link');
        if (invite.used_at)
            throw new common_1.UnauthorizedException('This invite link has already been used');
        if (new Date(invite.expires_at) <= new Date())
            throw new common_1.UnauthorizedException('This invite link has expired');
        const password_hash = await bcrypt.hash(password, 12);
        const { error: updateError } = await supabase
            .from('user_profile')
            .update({ password_hash, account_status: 'Active' })
            .eq('user_id', invite.user_id);
        if (updateError)
            throw new Error(updateError.message);
        await supabase
            .from('user_invites')
            .update({ used_at: new Date().toISOString() })
            .eq('invite_id', invite.invite_id);
        return { message: 'Password set successfully. You can now log in.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map