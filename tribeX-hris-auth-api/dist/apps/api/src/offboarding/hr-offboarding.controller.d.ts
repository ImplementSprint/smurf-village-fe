import { OffboardingService } from './offboarding.service';
import { CreateOffboardingCaseDto } from './dto/create-case.dto';
import { UpdateOffboardingStatusDto } from './dto/update-status.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { UpdateFinalPayDto } from './dto/update-final-pay.dto';
import { AcceptRejectCaseDto } from './dto/accept-reject-case.dto';
import { ConfigureChecklistTemplateDto } from './dto/configure-checklist-template.dto';
import { ReleaseClearanceDto } from './dto/release-clearance.dto';
import type { AuthenticatedRequest } from '@app/common';
export declare class HrOffboardingController {
    private readonly offboardingService;
    constructor(offboardingService: OffboardingService);
    configureTemplate(dto: ConfigureChecklistTemplateDto, req: AuthenticatedRequest): Promise<any>;
    getTemplates(req: AuthenticatedRequest): Promise<any[]>;
    createCase(dto: CreateOffboardingCaseDto, req: AuthenticatedRequest): Promise<any>;
    getAllCases(status?: string, offboarding_type?: string): Promise<any[]>;
    getCase(caseId: string): Promise<any>;
    acceptRejectCase(caseId: string, dto: AcceptRejectCaseDto, req: AuthenticatedRequest): Promise<{
        case_id: string;
        status: string;
    }>;
    updateStatus(caseId: string, dto: UpdateOffboardingStatusDto, req: AuthenticatedRequest): Promise<any>;
    getChecklist(caseId: string): Promise<any[]>;
    addChecklistItem(caseId: string, item_name: string): Promise<any>;
    updateChecklistItem(_caseId: string, itemId: string, dto: UpdateChecklistItemDto, req: AuthenticatedRequest): Promise<any>;
    getKT(caseId: string): Promise<any>;
    getSystemAccess(caseId: string): Promise<any[]>;
    addSystemAccess(caseId: string, system_name: string): Promise<any>;
    revokeAccess(_caseId: string, accessId: string, req: AuthenticatedRequest): Promise<any>;
    getFinalPay(caseId: string): Promise<any>;
    updateFinalPay(caseId: string, dto: UpdateFinalPayDto): Promise<any>;
    recomputeFinalPay(caseId: string): Promise<any>;
    releaseFinalPay(caseId: string): Promise<Record<string, unknown> | null>;
    confirmTransfer(caseId: string, req: AuthenticatedRequest): Promise<{
        message: string;
        case_id: string;
    }>;
    getClearanceDocs(caseId: string): Promise<any[]>;
    releaseClearanceDocs(caseId: string, dto: ReleaseClearanceDto, req: AuthenticatedRequest): Promise<any>;
    triggerJobPosting(caseId: string, req: AuthenticatedRequest): Promise<{
        message: string;
        job_posting_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    resetCase(caseId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        case_id: string;
    }>;
}
