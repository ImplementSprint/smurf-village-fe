import { PerformanceService } from './performance.service';
import { CreateGoalDto, CreateEvaluationDto, CreateViolationDto, CreatePipDto, PipUpdateDto, ReviewPipUpdateDto, ApproveItemDto, ReviewItemDto, AddCommentDto, PatchViolationDto, CycleSettingsDto, CreateViolationRuleDto, CreateBonusRuleDto, CreateCycleDto, PatchCycleDto, PatchGoalDto, GoalProgressDto, RejectGoalDto, CreateSelfAssessmentDto } from './dto/performance.dto';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    health(): {
        status: string;
    };
    getFullSettings(req: any): Promise<{
        settings: any;
        violation_rules: any[];
        bonus_rules: any[];
    }>;
    saveFullSettings(req: any, dto: CycleSettingsDto): Promise<{
        message: string;
    }>;
    saveFullSettingsPut(req: any, dto: CycleSettingsDto): Promise<{
        message: string;
    }>;
    saveFullSettingsPost(req: any, dto: CycleSettingsDto): Promise<{
        message: string;
    }>;
    createViolationRule(req: any, dto: CreateViolationRuleDto): Promise<any>;
    deleteViolationRule(ruleId: string, req: any): Promise<{
        message: string;
    }>;
    computeBonusRules(req: any, userId: string, rating: string): Promise<{
        bonus_amount: number;
        merit_amount: number;
        amount_type: any;
        bonus_pct: any;
        merit_increase_pct: any;
        promotion_eligible: any;
    }>;
    createBonusRule(req: any, dto: CreateBonusRuleDto): Promise<any>;
    updateBonusRule(id: string, req: any, dto: CreateBonusRuleDto): Promise<any>;
    deleteBonusRule(id: string, req: any): Promise<{
        message: string;
    }>;
    getActiveCycle(req: any): Promise<any>;
    getCycles(req: any): Promise<any[]>;
    createCycle(req: any, dto: CreateCycleDto): Promise<any>;
    patchCycle(id: string, req: any, dto: PatchCycleDto): Promise<any>;
    deleteCycle(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyGoals(req: any): Promise<unknown[]>;
    getTeamGoals(req: any): Promise<unknown[]>;
    getAllGoals(req: any): Promise<unknown[]>;
    createGoal(req: any, dto: CreateGoalDto): Promise<{
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
    approveGoal(id: string, req: any): Promise<{
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
    rejectGoal(id: string, req: any, dto: RejectGoalDto): Promise<{
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
    getGoalProgress(id: string): Promise<any[]>;
    addGoalProgress(id: string, req: any, dto: GoalProgressDto): Promise<any>;
    patchGoal(id: string, req: any, dto: PatchGoalDto): Promise<{
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
    deleteGoal(id: string, req: any): Promise<{
        message: string;
    }>;
    getMyEvaluations(req: any): Promise<any[]>;
    getMyEvaluationHistory(req: any): Promise<{
        year: string;
        cycle: any;
        score: string;
        label: any;
        status: string;
    }[]>;
    getTeamEvaluations(req: any): Promise<any[]>;
    getAllEvaluations(req: any): Promise<any[]>;
    getEvaluationById(id: string): Promise<any>;
    createEvaluation(req: any, dto: CreateEvaluationDto): Promise<any>;
    submitEvaluation(id: string, req: any): Promise<any>;
    countersignEvaluation(id: string, req: any): Promise<any>;
    acknowledgeEvaluation(id: string, req: any): Promise<any>;
    getEvaluationComments(evalId: string): Promise<any[]>;
    addEvaluationComment(evalId: string, req: any, dto: AddCommentDto): Promise<any>;
    getViolationsDetailed(req: any): Promise<{
        id: any;
        employeeName: string;
        employeeId: any;
        violationType: any;
        severity: any;
        description: any;
        date: string;
        suggestedAction: any;
    }[]>;
    getViolationStats(req: any): Promise<Record<string, number>>;
    getViolations(req: any): Promise<{
        id: any;
        employee: string;
        type: any;
        severity: any;
        date: string;
        avatar: string;
    }[]>;
    createViolation(req: any, dto: CreateViolationDto): Promise<{
        id: any;
        disciplinary_action: string | null;
        action_status: string;
        suggestion: string;
    }>;
    uploadViolationEvidence(file: Express.Multer.File, req: any): Promise<{
        url: string;
    }>;
    uploadPerformanceDocument(file: Express.Multer.File, req: any): Promise<{
        url: string;
    }>;
    patchViolation(id: string, req: any, dto: PatchViolationDto): Promise<any>;
    getMyPip(req: any): Promise<any[]>;
    getTeamPip(req: any): Promise<any[]>;
    getAllPip(req: any): Promise<any[]>;
    getPipById(id: string): Promise<any>;
    createPip(req: any, dto: CreatePipDto): Promise<any>;
    approvePip(id: string, req: any): Promise<any>;
    patchPipStatus(id: string, dto: any): Promise<any>;
    getPipUpdates(pipId: string): Promise<any[]>;
    createPipUpdate(pipId: string, req: any, dto: PipUpdateDto): Promise<any>;
    reviewPipUpdate(updateId: string, req: any, dto: ReviewPipUpdateDto): Promise<any>;
    getRewards(req: any): Promise<any[]>;
    syncAllRewards(req: any): Promise<{
        message: string;
        synced_count?: undefined;
    } | {
        message: string;
        synced_count: number;
    }>;
    syncReward(id: string): Promise<any>;
    getEmployeeDashboard(req: any): Promise<{
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
    getManagerDashboard(req: any): Promise<{
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
    getManagerTeam(req: any): Promise<any[]>;
    getHrDashboard(req: any): Promise<{
        total_employees: number;
        pending_count: number;
        violation_count: number;
        bonuses_pending_amount: number;
        bonuses_pending_count: number;
        pass_rate: number;
        cycle_name: any;
    }>;
    getHrApprovals(req: any, tab?: string): Promise<any[]>;
    approveHrItem(id: string, req: any, dto: ApproveItemDto): Promise<any>;
    reviewHrItem(id: string, req: any, dto: ReviewItemDto): Promise<any>;
    getActivityLogs(req: any, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMySelfAssessment(req: any): Promise<any>;
    createOrUpdateSelfAssessment(req: any, dto: CreateSelfAssessmentDto): Promise<any>;
    getSelfAssessmentByUser(targetUserId: string, req: any): Promise<any>;
    getRatingLabels(req: any): Promise<any[]>;
}
