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
exports.ApplicantJwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
let ApplicantJwtAuthGuard = class ApplicantJwtAuthGuard {
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
            if (decoded.role_name !== 'Applicant') {
                throw new common_1.UnauthorizedException('Applicant access only');
            }
            const supabase = this.supabaseService.getClient();
            const { data: blacklisted } = await supabase
                .from('token_blacklist')
                .select('token_hash')
                .eq('token_hash', sha256(token))
                .maybeSingle();
            if (blacklisted)
                throw new common_1.UnauthorizedException('Token has been revoked');
            const { data: applicant } = await supabase
                .from('applicant_profile')
                .select('status, email')
                .eq('applicant_id', decoded.sub_userid)
                .maybeSingle();
            if (!applicant || applicant.status === 'converted_employee' || applicant.status === 'inactive') {
                throw new common_1.UnauthorizedException('Account not active');
            }
            if (applicant.status !== 'active' && applicant.status !== 'onboarding') {
                throw new common_1.UnauthorizedException('Account not active');
            }
            if (applicant.email) {
                const { data: employeeProfile } = await supabase
                    .from('user_profile')
                    .select('user_id')
                    .eq('email', applicant.email)
                    .maybeSingle();
                if (employeeProfile) {
                    await supabase
                        .from('applicant_profile')
                        .update({ status: 'converted_employee' })
                        .eq('applicant_id', decoded.sub_userid);
                    throw new common_1.UnauthorizedException('Account has been converted to an employee account');
                }
            }
            req.user = decoded;
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException(err instanceof common_1.UnauthorizedException ? err.message : 'Invalid token');
        }
    }
};
exports.ApplicantJwtAuthGuard = ApplicantJwtAuthGuard;
exports.ApplicantJwtAuthGuard = ApplicantJwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        supabase_1.SupabaseService])
], ApplicantJwtAuthGuard);
//# sourceMappingURL=applicant-jwt-auth.guard.js.map