import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly config;
    private readonly defaultClient;
    private readonly scopedClients;
    constructor(config: ConfigService);
    getClient(): SupabaseClient;
    getClientForService(serviceName: string): SupabaseClient | null;
    listConfiguredServices(): string[];
    ping(serviceName?: string): Promise<boolean>;
    private normalizeServiceName;
}
