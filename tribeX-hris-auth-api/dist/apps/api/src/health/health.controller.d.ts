import type { Response } from 'express';
import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(response: Response): Promise<{
        status: string;
        uptimeSeconds: number;
        checks: {
            database: boolean;
            apiCenter: boolean;
        };
    }>;
}
