import { SupabaseService } from '@app/supabase';
export type IncidentSeverity = 'WARNING' | 'ERROR' | 'CRITICAL';
export declare class AuditService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private resolveUserId;
    log(action: string, performedBy: string, companyId: string, targetUserId?: string): Promise<void>;
    logIncident(action: string, severity: IncidentSeverity, options?: {
        companyId?: string;
        performedBy?: string;
        targetUserId?: string;
        ipAddress?: string;
    }): Promise<void>;
    getLogs(companyId: string, limit?: number, offset?: number): Promise<any[]>;
    getLogsCount(companyId: string): Promise<{
        count: number;
    }>;
}
