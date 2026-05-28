import { OffboardingService } from './offboarding.service';
import { CreateOffboardingCaseDto } from './dto/create-case.dto';
import { UpdateKnowledgeTransferDto } from './dto/update-knowledge-transfer.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class EmployeeOffboardingController {
    private readonly offboardingService;
    constructor(offboardingService: OffboardingService);
    createCase(dto: CreateOffboardingCaseDto, req: AuthenticatedRequest): Promise<any>;
    getMyCase(req: AuthenticatedRequest): Promise<any>;
    getChecklist(caseId: string): Promise<any[]>;
    acknowledgeAsset(_caseId: string, itemId: string, body: {
        proof_url?: string;
    }, req: AuthenticatedRequest): Promise<any>;
    updateKT(caseId: string, dto: UpdateKnowledgeTransferDto, req: AuthenticatedRequest): Promise<any>;
    getFinalPay(caseId: string): Promise<any>;
    getClearanceDocs(caseId: string): Promise<any[]>;
}
