import { SupabaseService } from '@app/supabase';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CnbService } from '../cnb/cnb.service';
import { CnbEncryptionService } from '../cnb/cnb-encryption.service';
import { CreateOffboardingCaseDto } from './dto/create-case.dto';
import { UpdateKnowledgeTransferDto } from './dto/update-knowledge-transfer.dto';
import { UpdateFinalPayDto } from './dto/update-final-pay.dto';
import { ConfigureChecklistTemplateDto } from './dto/configure-checklist-template.dto';
export declare function buildVacatedPositionTitle(input: {
    specificPositionTitle?: string | null;
    firstName: string;
    lastName: string;
}): string;
export declare class OffboardingService {
    private readonly supabaseService;
    private readonly auditService;
    private readonly notificationsService;
    private readonly cnbService;
    private readonly encryption;
    private readonly logger;
    private readonly defaultSystemAccessOptions;
    constructor(supabaseService: SupabaseService, auditService: AuditService, notificationsService: NotificationsService, cnbService: CnbService, encryption: CnbEncryptionService);
    private roundCurrency;
    private decryptPayslipFields;
    private parsePayslipMetadata;
    private isSettlementPayslipForCase;
    private isOffboardingSettlementPayslip;
    private findSettlementPayslips;
    private updateSettlementPayslipStatus;
    private getFinalSettlementPayslip;
    private ensureFinalSettlementPeriod;
    private syncFinalSettlementPayslip;
    private getLinkedPayrollReference;
    private recomputeFinalPayFromCompensation;
    enableOffboardingModule(companyId: string, performedBy: string): Promise<{
        message: string;
        company_id: string;
        status: string;
    }>;
    disableOffboardingModule(companyId: string, performedBy: string): Promise<{
        message: string;
        company_id: string;
        status: string;
    }>;
    getOffboardingAuditLogs(filters?: {
        company_id?: string;
        employee_id?: string;
    }): Promise<any[]>;
    configureChecklistTemplate(dto: ConfigureChecklistTemplateDto, companyId: string, hrUserId: string): Promise<any>;
    getChecklistTemplates(companyId: string): Promise<any[]>;
    getSystemAccessOptions(companyId: string): Promise<string[]>;
    updateChecklistTemplate(templateId: string, dto: ConfigureChecklistTemplateDto, companyId: string, actorUserId: string): Promise<any>;
    deleteChecklistTemplate(templateId: string, companyId: string, actorUserId: string): Promise<{
        success: boolean;
    }>;
    resetCase(caseId: string, actorUserId: string): Promise<{
        success: boolean;
        case_id: string;
    }>;
    createCase(dto: CreateOffboardingCaseDto, initiatedById: string): Promise<any>;
    getMyCaseByEmployeeId(userId: string): Promise<any>;
    getAllCases(filters?: {
        status?: string;
        offboarding_type?: string;
    }): Promise<any[]>;
    getCaseById(caseId: string): Promise<any>;
    acceptRejectCase(caseId: string, action: string, hrUserId: string, rejectionReason?: string, templateId?: string): Promise<{
        case_id: string;
        status: string;
    }>;
    private generateChecklistFromTemplate;
    updateStatus(caseId: string, newStatus: string, user: {
        sub_userid: string;
        role_name: string;
    }): Promise<any>;
    private validateCompletionReadiness;
    private deactivateEmployee;
    triggerJobPosting(caseId: string, hrUserId: string): Promise<{
        message: string;
        job_posting_id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    getChecklist(caseId: string): Promise<any[]>;
    addChecklistItem(caseId: string, itemName: string): Promise<any>;
    updateChecklistItem(itemId: string, status: string, userId: string): Promise<any>;
    acknowledgeAssetReturn(itemId: string, employeeId: string, proofUrl?: string): Promise<any>;
    private listFinalPayRecords;
    private pickCurrentFinalPay;
    private getLatestFinalPayRecord;
    getKnowledgeTransfer(caseId: string): Promise<any>;
    updateKnowledgeTransfer(caseId: string, dto: UpdateKnowledgeTransferDto, userId: string): Promise<any>;
    getSystemAccess(caseId: string): Promise<any[]>;
    addSystemAccess(caseId: string, systemName: string): Promise<any>;
    revokeSystemAccess(accessId: string, userId: string): Promise<any>;
    getFinalPay(caseId: string): Promise<any>;
    recomputeFinalPayManual(caseId: string): Promise<any>;
    updateFinalPay(caseId: string, dto: UpdateFinalPayDto): Promise<any>;
    releaseFinalPay(caseId: string): Promise<Record<string, unknown> | null>;
    recordPayTransferConfirmation(caseId: string, hrUserId: string): Promise<{
        message: string;
        case_id: string;
    }>;
    getClearanceDocuments(caseId: string): Promise<any[]>;
    releaseClearanceDocuments(caseId: string, hrUserId: string, notes?: string): Promise<any>;
}
