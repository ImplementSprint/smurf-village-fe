import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '@app/supabase';
import { LoginDto } from '../auth/dto/login.dto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthService {
    private readonly supabaseService;
    private readonly jwtService;
    private readonly config;
    private readonly mailService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, jwtService: JwtService, config: ConfigService, mailService: MailService);
    private writeIncidentLog;
    private logDevLink;
    private getAssignedRoles;
    private enforceSystemAdminSinglePortal;
    private ensureEmployeeRoleAssignment;
    private buildAccessPayload;
    private issueFreshUserInvite;
    private resendActivationInvite;
    requestPasswordReset(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto, req?: any): Promise<{
        access_token: string;
        refresh_token: string;
        refresh_max_age_ms: number;
        roles: string[];
        active_role: string;
        active_portal: string;
        available_portals: string[];
        role_switch_options: {
            role_id: string;
            role_name: string;
            portal_key: string;
        }[];
        requires_portal_selection: boolean;
    }>;
    logout(refreshToken: string, req?: any, accessToken?: string): Promise<{
        message: string;
        username: any;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        refresh_max_age_ms: number;
    }>;
    me(accessToken: string): Promise<{
        user_id: string;
        email: string;
        username: string | null;
        employee_id: string | null;
        company_id: string;
        role_id: string;
        role_name: string;
        role_ids: string[];
        active_portal: string;
        available_portals: string[];
        role_switch_options: {
            role_id: string;
            role_name: string;
            portal_key: string;
        }[];
        roles: string[];
    }>;
    switchRole(userId: string, companyId: string, requestedRoleId?: string): Promise<{
        access_token: string;
        roles: string[];
        active_role: string;
        active_portal: string;
        available_portals: string[];
        role_switch_options: {
            role_id: string;
            role_name: string;
            portal_key: string;
        }[];
        requires_portal_selection: boolean;
    }>;
    setPassword(token: string, password: string): Promise<{
        message: string;
    }>;
}
