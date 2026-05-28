import { TimekeepingService } from './timekeeping.service';
export declare class TimekeepingTasksService {
    private readonly timekeepingService;
    private readonly logger;
    constructor(timekeepingService: TimekeepingService);
    handleAutoMarkAbsent(): Promise<void>;
}
