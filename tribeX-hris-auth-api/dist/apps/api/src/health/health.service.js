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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const api_center_1 = require("../../../../libs/api-center/src");
const supabase_1 = require("../../../../libs/supabase/src");
let HealthService = class HealthService {
    supabaseService;
    apiCenterSdkService;
    startedAt = Date.now();
    constructor(supabaseService, apiCenterSdkService) {
        this.supabaseService = supabaseService;
        this.apiCenterSdkService = apiCenterSdkService;
    }
    async getHealth() {
        const [database, apiCenter] = await Promise.all([
            this.supabaseService.ping(),
            this.apiCenterSdkService.ping(),
        ]);
        const status = database && apiCenter ? 'ok' : database || apiCenter ? 'degraded' : 'error';
        return {
            status,
            uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
            checks: {
                database,
                apiCenter,
            },
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        api_center_1.ApiCenterSdkService])
], HealthService);
//# sourceMappingURL=health.service.js.map