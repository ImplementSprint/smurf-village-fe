import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '@app/supabase';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly supabaseService;
    constructor(jwtService: JwtService, supabaseService: SupabaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
