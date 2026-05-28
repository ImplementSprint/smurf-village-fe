import { ConfigService } from '@nestjs/config';
import { ApiCenterSdkService } from '@app/api-center';
export declare class MailService {
    private readonly config;
    private readonly apiCenterSdk;
    private readonly logger;
    constructor(config: ConfigService, apiCenterSdk: ApiCenterSdkService);
    private sendMail;
    sendInvite(to: string, inviteLink: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
    sendRegistrationConfirmation(to: string, companyName: string): Promise<void>;
    sendPaymentConfirmation(to: string, companyName: string, plan: string | null): Promise<void>;
    sendSystemAdminCredentials(to: string, inviteLink: string): Promise<void>;
    sendVerificationEmail(to: string, verifyLink: string): Promise<void>;
    sendInterviewScheduleEmail(opts: {
        to: string;
        applicantName: string;
        jobTitle: string;
        stageLabel?: string;
        isReschedule?: boolean;
        scheduledDate: string;
        scheduledTime: string;
        durationMinutes: number;
        format: string;
        location?: string | null;
        meetingLink?: string | null;
        interviewerName: string;
        interviewerTitle?: string | null;
        notes?: string | null;
    }): Promise<void>;
    sendApplicantResponseEmail(opts: {
        to: string;
        applicantName: string;
        applicantEmail: string;
        jobTitle: string;
        action: 'accepted' | 'declined' | 'reschedule_requested';
        note?: string | null;
        scheduledDate: string;
        scheduledTime: string;
    }): Promise<void>;
    sendInterviewCancellationEmail(opts: {
        to: string;
        applicantName: string;
        jobTitle: string;
        scheduledDate: string;
        scheduledTime: string;
        stageLabel: string;
        reason?: string | null;
    }): Promise<void>;
    sendApplicationStatusEmail(opts: {
        to: string;
        applicantName: string;
        jobTitle: string;
        status: string;
    }): Promise<void>;
    sendInterviewConfirmedEmail(opts: {
        to: string;
        applicantName: string;
        jobTitle: string;
        stageLabel: string;
        scheduledDate: string;
        scheduledTime: string;
    }): Promise<void>;
    sendOnboardingItemReviewedEmail(opts: {
        to: string;
        employeeName: string;
        itemTitle: string;
        tabCategory: string;
        status: 'approved' | 'rejected';
        remarks?: string | null;
    }): Promise<void>;
    sendOnboardingApprovedEmail(opts: {
        to: string;
        employeeName: string;
    }): Promise<void>;
    sendOnboardingRejectedEmail(opts: {
        to: string;
        employeeName: string;
        reason: string;
    }): Promise<void>;
    sendProfileChangeReviewedEmail(opts: {
        to: string;
        employeeName: string;
        fieldType: 'legal_name' | 'bank';
        status: 'approved' | 'rejected';
        reviewReason: string;
    }): Promise<void>;
    sendAbsenceReviewEmail(opts: {
        to: string;
        employeeName: string;
        reviewerName: string;
        action: 'APPROVED' | 'DENIED';
        absenceDate: string;
        absenceReason: string;
        reviewNote?: string | null;
    }): Promise<void>;
    sendLeaveReviewEmail(opts: {
        to: string;
        employeeName: string;
        reviewerName: string;
        status: 'Approved' | 'Rejected';
        leaveType: string;
        startDate: string;
        endDate: string;
        totalDays: number;
        rejectionReason?: string | null;
    }): Promise<void>;
    sendOvertimeReviewEmail(opts: {
        to: string;
        employeeName: string;
        reviewerName: string;
        status: 'APPROVED' | 'DENIED';
        overtimeType: string;
        otDate: string;
        startTime: string;
        endTime: string;
        plannedHours: number;
        denialReason?: string | null;
    }): Promise<void>;
    sendRenewalReminder(to: string, companyName: string, daysRemaining: number, plan: string): Promise<void>;
    sendSuspensionNotice(to: string, companyName: string): Promise<void>;
}
