"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const supabase_1 = require("../../../../libs/supabase/src");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const applicant_jwt_auth_guard_1 = require("./applicant-jwt-auth.guard");
const roles_guard_1 = require("./roles.guard");
const mail_module_1 = require("../mail/mail.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supabase_1.SupabaseModule,
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => mail_module_1.MailModule),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const secret = config.get('JWT_SECRET');
                    if (!secret || secret.length < 32) {
                        throw new Error('JWT_SECRET must be set and at least 32 characters long');
                    }
                    return { secret, signOptions: { expiresIn: '1d' } };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard, roles_guard_1.RolesGuard],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, applicant_jwt_auth_guard_1.ApplicantJwtAuthGuard, roles_guard_1.RolesGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map