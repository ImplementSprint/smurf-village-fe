import { OffboardingService } from './offboarding.service';
import { UpdateOffboardingStatusDto } from './dto/update-status.dto';
import { UpdateKnowledgeTransferDto } from './dto/update-knowledge-transfer.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class ManagerOffboardingController {
    private readonly offboardingService;
    constructor(offboardingService: OffboardingService);
    getAllCases(): Promise<any[]>;
    getCase(caseId: string): Promise<any>;
    updateStatus(caseId: string, dto: UpdateOffboardingStatusDto, req: AuthenticatedRequest): Promise<any>;
    updateKT(caseId: string, dto: UpdateKnowledgeTransferDto, req: AuthenticatedRequest): Promise<any>;
}
