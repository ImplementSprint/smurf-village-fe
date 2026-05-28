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
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    config;
    defaultClient;
    scopedClients = new Map();
    constructor(config) {
        this.config = config;
        const url = this.config.get('SUPABASE_URL')?.trim();
        const serviceRoleKey = this.config
            .get('SUPABASE_SERVICE_ROLE_KEY')
            ?.trim();
        this.defaultClient =
            url && serviceRoleKey
                ? (0, supabase_js_1.createClient)(url, serviceRoleKey, {
                    auth: { persistSession: false },
                })
                : null;
        const env = process.env;
        for (const [key, value] of Object.entries(env)) {
            if (!key.endsWith('_SUPABASE_URL') || !value)
                continue;
            const prefix = key.slice(0, -'_SUPABASE_URL'.length);
            const secretKey = env[`${prefix}_SUPABASE_SECRET_KEY`];
            if (!secretKey)
                continue;
            this.scopedClients.set(prefix.toLowerCase(), (0, supabase_js_1.createClient)(value, secretKey, {
                auth: { persistSession: false },
            }));
        }
    }
    getClient() {
        if (!this.defaultClient) {
            throw new Error('Default Supabase client is not configured');
        }
        return this.defaultClient;
    }
    getClientForService(serviceName) {
        return this.scopedClients.get(this.normalizeServiceName(serviceName)) ?? null;
    }
    listConfiguredServices() {
        return [...this.scopedClients.keys()].map((name) => name.toUpperCase());
    }
    async ping(serviceName) {
        try {
            const client = serviceName
                ? this.getClientForService(serviceName)
                : this.defaultClient;
            if (!client)
                return false;
            const operation = client.auth.admin.listUsers({ page: 1, perPage: 1 });
            await Promise.race([
                operation,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase ping timeout')), 3000)),
            ]);
            return true;
        }
        catch {
            return false;
        }
    }
    normalizeServiceName(serviceName) {
        return serviceName.trim().replace(/-/g, '_').toLowerCase();
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map