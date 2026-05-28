import { ConfigService } from '@nestjs/config';
import { TribeClient } from '@implementsprint/sdk';
export declare class ApiCenterSdkService {
    private readonly configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    getClient(): TribeClient;
    ping(): Promise<boolean>;
}
