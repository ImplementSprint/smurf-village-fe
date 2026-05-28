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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
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
let JwtAuthGuard = class JwtAuthGuard {
    jwtService;
    supabaseService;
    constructor(jwtService, supabaseService) {
        this.jwtService = jwtService;
        this.supabaseService = supabaseService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Missing Authorization header');
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization header format');
        }
        try {
            const decoded = this.jwtService.verify(token);
            if (decoded.type !== 'access') {
                throw new common_1.UnauthorizedException('Access token required');
            }
            const supabase = this.supabaseService.getClient();
            const { data: blacklisted } = await supabase
                .from('token_blacklist')
                .select('token_hash')
                .eq('token_hash', sha256(token))
                .maybeSingle();
            if (blacklisted)
                throw new common_1.UnauthorizedException('Token has been revoked');
            const { data: userStatus } = await supabase
                .from('user_profile')
                .select('user_id, company_id, role_id, email, employee_id, first_name, last_name, account_status')
                .eq('user_id', decoded.sub_userid)
                .maybeSingle();
            if (userStatus?.account_status === 'Inactive') {
                throw new common_1.UnauthorizedException('Account deactivated');
            }
            if (!userStatus?.user_id) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const { data: assignmentRows, error: assignmentsError } = await supabase
                .from('user_role_assignments')
                .select('role_id, is_primary')
                .eq('user_id', decoded.sub_userid)
                .eq('is_active', true);
            if (assignmentsError) {
                throw new common_1.UnauthorizedException('Role lookup failed');
            }
            const assignmentRoleIds = [...new Set((assignmentRows ?? [])
                    .map((row) => String(row.role_id ?? '').trim())
                    .filter(Boolean))];
            let roleAssignments = [];
            if (assignmentRoleIds.length > 0) {
                const { data: roleRows, error: roleRowsError } = await supabase
                    .from('role')
                    .select('role_id, role_name')
                    .in('role_id', assignmentRoleIds);
                if (roleRowsError) {
                    throw new common_1.UnauthorizedException('Role lookup failed');
                }
                const roleNameById = new Map((roleRows ?? []).map((role) => [
                    String(role.role_id ?? '').trim(),
                    String(role.role_name ?? '').trim(),
                ]));
                roleAssignments = (assignmentRows ?? [])
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
            if (roleAssignments.length === 0) {
                const fallbackRoleId = String(userStatus.role_id ?? '').trim();
                if (!fallbackRoleId) {
                    throw new common_1.UnauthorizedException('Role not found');
                }
                const { data: roleRow, error: roleError } = await supabase
                    .from('role')
                    .select('role_id, role_name')
                    .eq('role_id', fallbackRoleId)
                    .maybeSingle();
                if (roleError || !roleRow?.role_id || !roleRow?.role_name) {
                    throw new common_1.UnauthorizedException('Role not found');
                }
                roleAssignments = [
                    {
                        role_id: String(roleRow.role_id),
                        role_name: String(roleRow.role_name).trim(),
                        is_primary: true,
                        portal_key: roleNameToPortal(roleRow.role_name),
                    },
                ];
            }
            const requestedRoleId = String(decoded.role_id ?? '').trim();
            const activeRole = roleAssignments.find((role) => role.role_id === requestedRoleId) ??
                roleAssignments.find((role) => role.is_primary) ??
                roleAssignments[0];
            if (!activeRole) {
                throw new common_1.UnauthorizedException('Role not found');
            }
            const roleNames = [...new Set(roleAssignments.map((role) => role.role_name))];
            const roleIds = [...new Set(roleAssignments.map((role) => role.role_id))];
            const availablePortals = [...new Set(roleAssignments.map((role) => role.portal_key))];
            req.user = {
                ...decoded,
                sub_userid: String(userStatus.user_id),
                user_id: String(userStatus.user_id),
                company_id: String(userStatus.company_id ?? ''),
                email: String(userStatus.email ?? ''),
                employee_id: String(userStatus.employee_id ?? ''),
                first_name: String(userStatus.first_name ?? ''),
                last_name: String(userStatus.last_name ?? ''),
                role_id: activeRole.role_id,
                role_name: activeRole.role_name,
                role_ids: roleIds,
                roles: roleNames,
                active_portal: activeRole.portal_key,
                available_portals: availablePortals,
                role_switch_options: roleAssignments.map((role) => ({
                    role_id: role.role_id,
                    role_name: role.role_name,
                    portal_key: role.portal_key,
                })),
            };
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException(err instanceof common_1.UnauthorizedException ? err.message : 'Invalid token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        supabase_1.SupabaseService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map