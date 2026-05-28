"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OvertimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimeService = void 0;
const crypto = __importStar(require("node:crypto"));
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../libs/common/src");
const mail_service_1 = require("../mail/mail.service");
const supabase_1 = require("../../../../libs/supabase/src");
const file_overtime_request_dto_1 = require("./dto/file-overtime-request.dto");
const review_overtime_request_dto_1 = require("./dto/review-overtime-request.dto");
const SCHEDULE_SELECT_FIELDS = 'sched_id, employee_id, effective_from, workdays, start_time, end_time, break_start, break_end, is_nightshift, schedule_source, updated_by_name, updated_at';
function getManilaDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(date);
}
function getIpAddress(req) {
    if (!req || typeof req !== 'object')
        return null;
    const request = req;
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0]?.trim() ?? null;
    }
    return request.ip ?? request.socket?.remoteAddress ?? null;
}
function computePlannedHours(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    if (endTotal <= startTotal) {
        throw new common_1.BadRequestException('End time must be after start time.');
    }
    const hours = (endTotal - startTotal) / 60;
    if (hours <= 0 || hours > 24) {
        throw new common_1.BadRequestException('Planned hours must be between 0 and 24.');
    }
    return Math.round(hours * 100) / 100;
}
function normalizeWorkdays(workdays) {
    if (!workdays)
        return [];
    const normalize = (value) => {
        const day = value.trim().toUpperCase();
        if (day === 'TUES')
            return 'TUE';
        if (day === 'THURS')
            return 'THU';
        return day;
    };
    if (Array.isArray(workdays))
        return workdays.map(normalize);
    return String(workdays)
        .split(',')
        .map(normalize);
}
function isScheduledForDate(workdays, dateStr) {
    const dayCode = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: 'Asia/Manila',
    })
        .format(new Date(`${dateStr}T00:00:00+08:00`))
        .toUpperCase();
    return normalizeWorkdays(workdays).includes(dayCode);
}
let OvertimeService = OvertimeService_1 = class OvertimeService {
    supabaseService;
    mailService;
    logger = new common_1.Logger(OvertimeService_1.name);
    constructor(supabaseService, mailService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
    }
    async getEmployeeId(userId) {
        const { data } = await this.supabaseService
            .getClient()
            .from('user_profile')
            .select('employee_id')
            .eq('user_id', userId)
            .maybeSingle();
        return data?.employee_id ?? null;
    }
    async getScheduleForEmployee(employeeId, asOfDate) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('schedules')
            .select(SCHEDULE_SELECT_FIELDS)
            .eq('employee_id', employeeId)
            .lte('effective_from', asOfDate)
            .order('effective_from', { ascending: false })
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data ?? null;
    }
    async createOvertimeRequest(userId, dto, req) {
        const supabase = this.supabaseService.getClient();
        const today = getManilaDateString();
        const employeeId = await this.getEmployeeId(userId);
        if (!employeeId) {
            throw new common_1.BadRequestException('Employee profile not found.');
        }
        if (dto.ot_date <= today) {
            throw new common_1.BadRequestException('Overtime must be requested in advance.');
        }
        const plannedHours = computePlannedHours(dto.start_time, dto.end_time);
        if (dto.ot_type === file_overtime_request_dto_1.OvertimeType.NORMAL || dto.ot_type === file_overtime_request_dto_1.OvertimeType.REST_DAY) {
            const schedule = await this.getScheduleForEmployee(employeeId, dto.ot_date);
            if (!schedule) {
                throw new common_1.BadRequestException('No schedule assigned for this employee.');
            }
            const isWorkday = isScheduledForDate(schedule.workdays, dto.ot_date);
            if (dto.ot_type === file_overtime_request_dto_1.OvertimeType.NORMAL && !isWorkday) {
                throw new common_1.BadRequestException('Normal overtime must be on a scheduled workday.');
            }
            if (dto.ot_type === file_overtime_request_dto_1.OvertimeType.REST_DAY && isWorkday) {
                throw new common_1.BadRequestException('Rest day overtime must be on a rest day.');
            }
        }
        const { data: existing } = await supabase
            .from('overtime_requests')
            .select('ot_id, start_time, end_time')
            .eq('employee_id', employeeId)
            .eq('ot_date', dto.ot_date)
            .in('log_status', ['PENDING', 'APPROVED']);
        for (const row of existing ?? []) {
            const existingStart = row.start_time.split(':').map(Number);
            const existingEnd = row.end_time.split(':').map(Number);
            const nextStart = dto.start_time.split(':').map(Number);
            const nextEnd = dto.end_time.split(':').map(Number);
            const existingStartMinutes = existingStart[0] * 60 + existingStart[1];
            const existingEndMinutes = existingEnd[0] * 60 + existingEnd[1];
            const nextStartMinutes = nextStart[0] * 60 + nextStart[1];
            const nextEndMinutes = nextEnd[0] * 60 + nextEnd[1];
            if (nextStartMinutes < existingEndMinutes && nextEndMinutes > existingStartMinutes) {
                throw new common_1.BadRequestException('An overlapping overtime request already exists for that date and time window.');
            }
        }
        const dayStart = `${dto.ot_date}T00:00:00.000+08:00`;
        const dayEnd = `${dto.ot_date}T23:59:59.999+08:00`;
        const { data: absences } = await supabase
            .from('attendance_time_logs')
            .select('log_id')
            .eq('employee_id', employeeId)
            .eq('log_type', 'absence')
            .neq('log_status', 'DENIED')
            .gte('timestamp', dayStart)
            .lte('timestamp', dayEnd)
            .limit(1);
        if ((absences ?? []).length > 0) {
            throw new common_1.BadRequestException('Cannot request overtime on a date with an absence record.');
        }
        const otId = crypto.randomUUID();
        const { error } = await supabase.from('overtime_requests').insert({
            ot_id: otId,
            employee_id: employeeId,
            ot_type: dto.ot_type,
            ot_date: dto.ot_date,
            start_time: dto.start_time,
            end_time: dto.end_time,
            planned_hours: plannedHours,
            reason: dto.reason ?? null,
            log_status: 'PENDING',
            latitude: dto.latitude,
            longitude: dto.longitude,
            ip_address: getIpAddress(req),
            requested_by: userId,
        });
        if (error) {
            common_2.DatabaseErrorHandler.handle(error, 'createOvertimeRequest', this.logger);
        }
        return {
            ot_id: otId,
            employee_id: employeeId,
            ot_type: dto.ot_type,
            ot_date: dto.ot_date,
            start_time: dto.start_time,
            end_time: dto.end_time,
            planned_hours: plannedHours,
            reason: dto.reason ?? null,
            log_status: 'PENDING',
        };
    }
    async getMyOvertimeRequests(userId) {
        const employeeId = await this.getEmployeeId(userId);
        if (!employeeId)
            return [];
        const { data, error } = await this.supabaseService
            .getClient()
            .from('overtime_requests')
            .select('*')
            .eq('employee_id', employeeId)
            .order('ot_date', { ascending: false });
        if (error)
            throw new Error(error.message);
        return (data ?? []);
    }
    async getMyOvertimeSummary(userId, month) {
        const employeeId = await this.getEmployeeId(userId);
        if (!employeeId)
            return { approved_planned_hours: 0 };
        const targetMonth = month ?? getManilaDateString().slice(0, 7);
        const [year, monthNumber] = targetMonth.split('-').map(Number);
        const firstDay = `${targetMonth}-01`;
        const lastDay = new Date(year, monthNumber, 0).toISOString().split('T')[0];
        const { data, error } = await this.supabaseService
            .getClient()
            .from('overtime_requests')
            .select('planned_hours')
            .eq('employee_id', employeeId)
            .eq('log_status', 'APPROVED')
            .gte('ot_date', firstDay)
            .lte('ot_date', lastDay);
        if (error)
            throw new Error(error.message);
        const approvedPlannedHours = (data ?? []).reduce((sum, row) => sum + Number(row.planned_hours), 0);
        return { approved_planned_hours: approvedPlannedHours };
    }
    async getOvertimeRequests(companyId, status, type) {
        const supabase = this.supabaseService.getClient();
        const { data: profiles } = await supabase
            .from('user_profile')
            .select('employee_id, user_id, first_name, last_name')
            .eq('company_id', companyId)
            .not('employee_id', 'is', null);
        const allProfiles = profiles ?? [];
        if (allProfiles.length === 0)
            return [];
        const employeeIds = allProfiles.map((profile) => profile.employee_id);
        const profileMap = new Map(allProfiles.map((profile) => [profile.employee_id, profile]));
        let query = supabase
            .from('overtime_requests')
            .select('*')
            .in('employee_id', employeeIds)
            .order('ot_date', { ascending: false });
        if (status && status !== 'ALL') {
            query = query.eq('log_status', status.toUpperCase());
        }
        else if (!status) {
            query = query.eq('log_status', 'PENDING');
        }
        if (type) {
            query = query.eq('ot_type', type.toUpperCase());
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return (data ?? []).map((row) => ({
            ...row,
            employee: profileMap.get(row.employee_id) ?? null,
        }));
    }
    async reviewOvertimeRequest(otId, dto, companyId, reviewerUserId) {
        const supabase = this.supabaseService.getClient();
        if (dto.action === review_overtime_request_dto_1.OvertimeReviewAction.DENY &&
            (!dto.review_reason || dto.review_reason.trim().length < 3)) {
            throw new common_1.BadRequestException('A denial reason with at least 3 characters is required.');
        }
        const { data: target, error: fetchError } = await supabase
            .from('overtime_requests')
            .select('*')
            .eq('ot_id', otId)
            .maybeSingle();
        if (fetchError)
            throw new Error(fetchError.message);
        if (!target)
            throw new common_1.NotFoundException('Overtime request not found.');
        if (target.log_status !== 'PENDING') {
            throw new common_1.BadRequestException('This overtime request has already been reviewed.');
        }
        const { data: owner } = await supabase
            .from('user_profile')
            .select('user_id, company_id, first_name, last_name, email, employee_id')
            .eq('employee_id', target.employee_id)
            .eq('company_id', companyId)
            .maybeSingle();
        if (!owner) {
            throw new common_1.NotFoundException('Overtime request not found in your company.');
        }
        const nextStatus = dto.action === review_overtime_request_dto_1.OvertimeReviewAction.APPROVE ? 'APPROVED' : 'DENIED';
        const { data: updated, error: updateError } = await supabase
            .from('overtime_requests')
            .update({
            log_status: nextStatus,
            reviewed_by: reviewerUserId,
            reviewed_at: new Date().toISOString(),
            review_reason: dto.review_reason ?? null,
        })
            .eq('ot_id', otId)
            .select('*')
            .maybeSingle();
        if (updateError)
            throw new Error(updateError.message);
        if (!updated)
            throw new common_1.NotFoundException('Overtime request not found.');
        this.logger.log(`Overtime request ${nextStatus}: ${otId}`);
        void (async () => {
            try {
                if (owner?.email) {
                    const reviewer = await this.supabaseService
                        .getClient()
                        .from('user_profile')
                        .select('first_name, last_name')
                        .eq('user_id', reviewerUserId)
                        .maybeSingle();
                    const typeMap = {
                        NORMAL: 'Normal Overtime',
                        REST_DAY: 'Rest Day Overtime',
                        HOLIDAY: 'Holiday Overtime',
                    };
                    await this.mailService.sendOvertimeReviewEmail({
                        to: owner.email,
                        employeeName: `${owner.first_name} ${owner.last_name}`,
                        reviewerName: reviewer.data ? `${reviewer.data.first_name} ${reviewer.data.last_name}` : 'HR',
                        status: nextStatus,
                        overtimeType: updated.ot_type,
                        otDate: updated.ot_date,
                        startTime: updated.start_time,
                        endTime: updated.end_time,
                        plannedHours: updated.planned_hours,
                        denialReason: dto.review_reason ?? null,
                    });
                }
            }
            catch (e) {
                this.logger.warn(`Overtime review email failed: ${e.message}`);
            }
        })();
        return {
            ...updated,
            employee: owner,
        };
    }
};
exports.OvertimeService = OvertimeService;
exports.OvertimeService = OvertimeService = OvertimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService])
], OvertimeService);
//# sourceMappingURL=overtime.service.js.map