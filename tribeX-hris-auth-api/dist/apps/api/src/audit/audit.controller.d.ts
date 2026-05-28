import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(req: any, limit?: string, offset?: string): Promise<any[]>;
    getLogsCount(req: any): Promise<{
        count: number;
    }>;
}
