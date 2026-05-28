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
var ApiCenterSdkService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCenterSdkService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@implementsprint/sdk");
let ApiCenterSdkService = ApiCenterSdkService_1 = class ApiCenterSdkService {
    configService;
    logger = new common_1.Logger(ApiCenterSdkService_1.name);
    client = null;
    constructor(configService) {
        this.configService = configService;
    }
    getClient() {
        if (this.client)
            return this.client;
        const gatewayUrl = this.configService.get('APICENTER_BASE_URL')
            ?? this.configService.get('API_CENTER_BASE_URL');
        const tribeId = this.configService.get('APICENTER_TRIBE_ID')
            ?? this.configService.get('API_CENTER_TRIBE_ID');
        const secret = this.configService.get('APICENTER_TRIBE_SECRET')
            ?? this.configService.get('API_CENTER_TRIBE_SECRET');
        if (!gatewayUrl || !tribeId || !secret) {
            throw new Error('APICENTER_BASE_URL, APICENTER_TRIBE_ID, and APICENTER_TRIBE_SECRET must all be configured.');
        }
        const timeoutRaw = this.configService.get('APICENTER_TIMEOUT_MS')
            ?? this.configService.get('API_CENTER_TIMEOUT_MS');
        const timeout = timeoutRaw ? Number(timeoutRaw) : undefined;
        this.client = new sdk_1.TribeClient({ gatewayUrl, tribeId, secret, timeout });
        return this.client;
    }
    async ping() {
        try {
            await this.getClient().authenticate();
            return true;
        }
        catch (error) {
            this.logger.warn(`APICenter health check failed: ${error instanceof Error ? error.message : 'unknown error'}`);
            return false;
        }
    }
};
exports.ApiCenterSdkService = ApiCenterSdkService;
exports.ApiCenterSdkService = ApiCenterSdkService = ApiCenterSdkService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiCenterSdkService);
//# sourceMappingURL=api-center-sdk.service.js.map