import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, req: Request, res: Response): Promise<{
        access_token: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        access_token: string;
    }>;
    logout(req: Request, res: Response, authHeader?: string): Promise<{
        message: string;
    }>;
    setPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    me(authHeader?: string): Promise<{
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
    switchRole(req: AuthenticatedRequest, dto: SwitchRoleDto): Promise<{
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
}
