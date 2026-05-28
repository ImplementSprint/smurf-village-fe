import { SuperAdminAuthService } from './super-admin-auth.service';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
export declare class SuperAdminAuthController {
    private readonly service;
    constructor(service: SuperAdminAuthService);
    login(dto: SuperAdminLoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
}
