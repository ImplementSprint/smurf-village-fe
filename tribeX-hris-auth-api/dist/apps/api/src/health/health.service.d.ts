import { ApiCenterSdkService } from '@app/api-center';
import { SupabaseService } from '@app/supabase';
export declare class HealthService {
    private readonly supabaseService;
    private readonly apiCenterSdkService;
    private readonly startedAt;
    constructor(supabaseService: SupabaseService, apiCenterSdkService: ApiCenterSdkService);
    getHealth(): Promise<{
        status: string;
        uptimeSeconds: number;
        checks: {
            database: boolean;
            apiCenter: boolean;
        };
    }>;
}
