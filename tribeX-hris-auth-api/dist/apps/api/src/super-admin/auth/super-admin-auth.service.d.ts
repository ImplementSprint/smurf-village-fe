import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '@app/supabase';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
export declare class SuperAdminAuthService {
    private readonly supabaseService;
    private readonly jwtService;
    private readonly config;
    constructor(supabaseService: SupabaseService, jwtService: JwtService, config: ConfigService);
    login(dto: SuperAdminLoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
}
