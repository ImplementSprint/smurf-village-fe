import { OnboardingService } from './onboarding.service';
export declare class NewHireController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    getMyOnboarding(req: any): Promise<any>;
    saveOnboarding(req: any, body: Record<string, any>): Promise<any>;
    submitOnboarding(req: any): Promise<any>;
    getSubmissions(req: any, status?: string): Promise<any[]>;
    getSubmission(id: string, req: any): Promise<any>;
    approveSubmission(id: string, roleId: string, req: any): Promise<{
        user_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        email: any;
        invite_expires_at: string;
    }>;
    rejectSubmission(id: string, hrNotes: string, req: any): Promise<{
        message: string;
    }>;
}
