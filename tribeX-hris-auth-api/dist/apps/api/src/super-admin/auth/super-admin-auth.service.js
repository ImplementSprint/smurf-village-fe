"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_1 = require("../../../../../libs/supabase/src");
let SuperAdminAuthService = class SuperAdminAuthService {
    supabaseService;
    jwtService;
    config;
    constructor(supabaseService, jwtService, config) {
        this.supabaseService = supabaseService;
        this.jwtService = jwtService;
        this.config = config;
    }
    async login(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });
        if (authError || !authData.user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const role = authData.user.user_metadata?.role;
        if (role !== 'super_admin') {
            throw new common_1.UnauthorizedException('Access denied — not a super admin');
        }
        const { data: adminUser, error: dbError } = await supabase
            .from('super_admin_users')
            .select('id, email, name')
            .eq('id', authData.user.id)
            .maybeSingle();
        if (dbError || !adminUser) {
            throw new common_1.UnauthorizedException('Super admin record not found');
        }
        const payload = {
            sub: adminUser.id,
            email: adminUser.email,
            role: 'super_admin',
            name: adminUser.name,
        };
        const access_token = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '8h',
        });
        return {
            access_token,
            user: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
        };
    }
};
exports.SuperAdminAuthService = SuperAdminAuthService;
exports.SuperAdminAuthService = SuperAdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], SuperAdminAuthService);
//# sourceMappingURL=super-admin-auth.service.js.map