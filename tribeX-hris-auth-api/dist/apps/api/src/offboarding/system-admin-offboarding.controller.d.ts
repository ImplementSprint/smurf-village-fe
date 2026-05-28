import { OffboardingService } from './offboarding.service';
import type { AuthenticatedRequest } from '@app/common';
import { ConfigureChecklistTemplateDto } from './dto/configure-checklist-template.dto';
export declare class SystemAdminOffboardingController {
    private readonly offboardingService;
    constructor(offboardingService: OffboardingService);
    enable(companyId: string, req: AuthenticatedRequest): Promise<{
        message: string;
        company_id: string;
        status: string;
    }>;
    disable(companyId: string, req: AuthenticatedRequest): Promise<{
        message: string;
        company_id: string;
        status: string;
    }>;
    getAuditLogs(company_id?: string, employee_id?: string): Promise<any[]>;
    configureTemplate(companyId: string, dto: ConfigureChecklistTemplateDto, req: AuthenticatedRequest): Promise<any>;
    getTemplates(companyId: string): Promise<any[]>;
    getSystemAccessOptions(companyId: string): Promise<string[]>;
    updateTemplate(companyId: string, templateId: string, dto: ConfigureChecklistTemplateDto, req: AuthenticatedRequest): Promise<any>;
    deleteTemplate(companyId: string, templateId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
}
