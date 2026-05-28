import { CnbEncryptionService } from '../cnb/cnb-encryption.service';
import { SupabaseService } from '@app/supabase';
export declare class PerformanceService {
    private readonly supabaseService;
    private readonly encryption;
    constructor(supabaseService: SupabaseService, encryption: CnbEncryptionService);
    private get db();
    private getAllCycleIds;
    private getEvalIdsForCycle;
    private getActiveCycle;
    private logActivity;
    private actorRole;
    private roundCurrency;
    private normalizePipStatus;
    private ensureRewardBenefitCatalog;
    private syncRewardIntoPayroll;
    private calcRewardAmount;
    private mapGoal;
    getFullSettings(companyId: string): Promise<{
        settings: any;
        violation_rules: any[];
        bonus_rules: any[];
    }>;
    saveFullSettings(companyId: string, userId: string, body: any): Promise<{
        message: string;
    }>;
    createViolationRule(companyId: string, dto: any): Promise<any>;
    deleteViolationRule(ruleId: string, companyId: string): Promise<{
        message: string;
    }>;
    createBonusRule(companyId: string, dto: any): Promise<any>;
    updateBonusRule(ruleId: string, companyId: string, dto: any): Promise<any>;
    deleteBonusRule(ruleId: string, companyId: string): Promise<{
        message: string;
    }>;
    getCycles(companyId: string): Promise<any[]>;
    getActiveCyclePublic(companyId: string): Promise<any>;
    createCycle(companyId: string, userId: string, dto: any): Promise<any>;
    patchCycle(cycleId: string, companyId: string, dto: any): Promise<any>;
    deleteCycle(cycleId: string, companyId: string): Promise<{
        message: string;
    }>;
    getMyGoals(userId: string, companyId: string): Promise<unknown[]>;
    getTeamGoals(managerId: string, companyId: string): Promise<unknown[]>;
    getAllGoals(companyId: string): Promise<unknown[]>;
    createGoal(requesterId: string, requesterRole: string, companyId: string, dto: any): Promise<{
        id: any;
        user_id: any;
        category: any;
        title: any;
        desc: any;
        progress: any;
        status: string;
        statusColor: string;
        isPending: boolean;
        priority: any;
        deadline: any;
        set_by: any;
        approved_by: any;
        approved_at: any;
        rejected_reason: any;
    }>;
    patchGoal(goalId: string, requesterId: string, companyId: string, dto: any): Promise<{
        id: any;
        user_id: any;
        category: any;
        title: any;
        desc: any;
        progress: any;
        status: string;
        statusColor: string;
        isPending: boolean;
        priority: any;
        deadline: any;
        set_by: any;
        approved_by: any;
        approved_at: any;
        rejected_reason: any;
    }>;
    deleteGoal(goalId: string, requesterId: string, companyId: string): Promise<{
        message: string;
    }>;
    approveGoal(goalId: string, approverId: string, companyId: string): Promise<{
        id: any;
        user_id: any;
        category: any;
        title: any;
        desc: any;
        progress: any;
        status: string;
        statusColor: string;
        isPending: boolean;
        priority: any;
        deadline: any;
        set_by: any;
        approved_by: any;
        approved_at: any;
        rejected_reason: any;
    }>;
    rejectGoal(goalId: string, approverId: string, companyId: string, reason?: string): Promise<{
        id: any;
        user_id: any;
        category: any;
        title: any;
        desc: any;
        progress: any;
        status: string;
        statusColor: string;
        isPending: boolean;
        priority: any;
        deadline: any;
        set_by: any;
        approved_by: any;
        approved_at: any;
        rejected_reason: any;
    }>;
    getGoalProgress(goalId: string): Promise<any[]>;
    addGoalProgress(goalId: string, userId: string, companyId: string, dto: any): Promise<any>;
    private buildGoalsChecklist;
    getMyEvaluations(userId: string, companyId: string): Promise<any[]>;
    getMyEvaluationHistory(userId: string, companyId: string): Promise<{
        year: string;
        cycle: any;
        score: string;
        label: any;
        status: string;
    }[]>;
    getTeamEvaluations(managerId: string, companyId: string): Promise<any[]>;
    getAllEvaluations(companyId: string): Promise<any[]>;
    getEvaluationById(evalId: string): Promise<any>;
    createEvaluation(reviewerId: string, reviewerRole: string, companyId: string, dto: any): Promise<any>;
    submitEvaluation(evalId: string, reviewerId: string, companyId: string): Promise<any>;
    countersignEvaluation(evalId: string, hrId: string, companyId: string): Promise<any>;
    acknowledgeEvaluation(evalId: string, userId: string): Promise<any>;
    getEvaluationComments(evalId: string): Promise<any[]>;
    addEvaluationComment(evalId: string, userId: string, userRole: string, dto: any): Promise<any>;
    private formatDate;
    private getInitials;
    getViolations(companyId: string): Promise<{
        id: any;
        employee: string;
        type: any;
        severity: any;
        date: string;
        avatar: string;
    }[]>;
    getViolationsDetailed(companyId: string): Promise<{
        id: any;
        employeeName: string;
        employeeId: any;
        violationType: any;
        severity: any;
        description: any;
        date: string;
        suggestedAction: any;
    }[]>;
    getViolationStats(companyId: string): Promise<Record<string, number>>;
    createViolation(loggedBy: string, loggerRole: string, companyId: string, dto: any): Promise<{
        id: any;
        disciplinary_action: string | null;
        action_status: string;
        suggestion: string;
    }>;
    patchViolation(violId: string, companyId: string, dto: any): Promise<any>;
    uploadViolationEvidence(file: Express.Multer.File, companyId: string): Promise<{
        url: string;
    }>;
    uploadPerformanceDocument(file: Express.Multer.File, companyId: string): Promise<{
        url: string;
    }>;
    getMyPip(userId: string, companyId: string): Promise<any[]>;
    getTeamPip(managerId: string, companyId: string): Promise<any[]>;
    getAllPip(companyId: string): Promise<any[]>;
    getPipById(pipId: string): Promise<any>;
    createPip(initiatorId: string, initiatorRole: string, companyId: string, dto: any): Promise<any>;
    approvePip(pipId: string, approverId: string, companyId: string): Promise<any>;
    patchPipStatus(pipId: string, dto: any): Promise<any>;
    getPipUpdates(pipId: string): Promise<any[]>;
    createPipUpdate(pipId: string, userId: string, dto: any): Promise<any>;
    reviewPipUpdate(updateId: string, reviewerId: string, dto: any): Promise<any>;
    getRewards(companyId: string): Promise<any[]>;
    syncReward(rewardId: string): Promise<any>;
    syncAllRewards(companyId: string): Promise<{
        message: string;
        synced_count?: undefined;
    } | {
        message: string;
        synced_count: number;
    }>;
    computeBonusRules(companyId: string, userId: string, rating: number): Promise<{
        bonus_amount: number;
        merit_amount: number;
        amount_type: any;
        bonus_pct: any;
        merit_increase_pct: any;
        promotion_eligible: any;
    }>;
    getEmployeeDashboard(userId: string, companyId: string): Promise<{
        overall_progress_pct: number;
        cycle_stage: string;
        active_goals_count: number;
        achieved_count: number;
        days_to_year_end: number;
        midyear_rating: null;
        midyear_rating_label: null;
        cycle_name?: undefined;
    } | {
        overall_progress_pct: number;
        cycle_stage: any;
        cycle_name: any;
        active_goals_count: number;
        achieved_count: number;
        days_to_year_end: number;
        midyear_rating: any;
        midyear_rating_label: any;
    }>;
    getManagerDashboard(managerId: string, companyId: string): Promise<{
        team_count: number;
        team_avg_rating: number;
        on_track_count: number;
        at_risk_count: number;
        active_pip_count: number;
        exceeding_count: number;
        cycle_name?: undefined;
        cycle_stage?: undefined;
    } | {
        team_count: number;
        team_avg_rating: number;
        on_track_count: number;
        at_risk_count: number;
        active_pip_count: number;
        exceeding_count: number;
        cycle_name: any;
        cycle_stage: any;
    }>;
    getManagerTeam(managerId: string, companyId: string): Promise<any[]>;
    getHrDashboard(companyId: string): Promise<{
        total_employees: number;
        pending_count: number;
        violation_count: number;
        bonuses_pending_amount: number;
        bonuses_pending_count: number;
        pass_rate: number;
        cycle_name: any;
    }>;
    getHrApprovals(companyId: string, tab?: string): Promise<any[]>;
    approveHrItem(itemId: string, approverId: string, dto: any): Promise<any>;
    reviewHrItem(itemId: string, approverId: string, dto: any): Promise<any>;
    getActivityLogs(companyId: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMySelfAssessment(userId: string, companyId: string): Promise<any>;
    createOrUpdateSelfAssessment(userId: string, companyId: string, dto: any): Promise<any>;
    getSelfAssessmentByUser(targetUserId: string, companyId: string): Promise<any>;
    getRatingLabels(companyId: string): Promise<any[]>;
}
