import { SupabaseService } from '@app/supabase';
import { MailService } from '../mail/mail.service';
import { TimePunchDto } from './dto/time-punch.dto';
import { ReportAbsenceDto } from './dto/report-absence.dto';
import { UpsertScheduleDto } from './dto/upsert-schedule.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';
import { ScheduleEffectiveDateDto } from './dto/schedule-effective-date.dto';
import { CompanyDefaultScheduleDto } from './dto/company-default-schedule.dto';
import { ReviewAbsenceDto } from './dto/review-absence.dto';
import { EditAttendanceDto } from './dto/edit-attendance.dto';
type AttendanceLogType = 'time-in' | 'time-out' | 'break-start' | 'break-end' | 'absence';
type ClockType = 'ON-TIME' | 'LATE' | 'EARLY' | 'OVERTIME' | 'ABSENT_NO_CLOCKIN' | 'NO_CLOCKOUT';
type TimeLogRow = {
    log_id: string;
    employee_id: string | null;
    schedule_id: string | null;
    log_type: AttendanceLogType;
    timestamp: string;
    latitude: number | null;
    longitude: number | null;
    ip_address: string | null;
    is_mock_location: boolean;
    clock_type?: ClockType | null;
    status?: string | null;
    log_status: string | null;
    location_name?: string | null;
    absence_reason?: string | null;
    absence_notes?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    review_reason?: string | null;
    edited_by?: string | null;
    edited_at?: string | null;
    edit_reason?: string | null;
};
type ScheduleRow = {
    sched_id: string;
    employee_id: string;
    effective_from?: string | null;
    workdays: string | string[] | null;
    start_time: string | null;
    end_time: string | null;
    break_start?: string | null;
    break_end?: string | null;
    is_nightshift: boolean | null;
    schedule_source?: 'bulk' | 'department' | 'individual' | 'default' | null;
    updated_by_name?: string | null;
    updated_at?: string | null;
};
type CompanyDefaultScheduleRow = {
    company_id: string;
    workdays: string | null;
    start_time: string | null;
    end_time: string | null;
    break_start?: string | null;
    break_end?: string | null;
    is_nightshift: boolean | null;
    effective_from?: string | null;
    updated_by?: string | null;
    updated_by_name?: string | null;
    updated_at?: string | null;
};
type EmployeeDepartmentRelation = {
    department_name?: string | null;
} | Array<{
    department_name?: string | null;
}> | null | undefined;
type EmployeeUserRow = {
    user_id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    department_id: string | null;
    department?: EmployeeDepartmentRelation;
    department_name?: string | null;
};
export declare class TimekeepingService {
    private readonly supabaseService;
    private readonly mailService;
    private readonly logger;
    private readonly geocodeEndpoint;
    private readonly geocodeEnabled;
    private readonly geocodeTimeoutMs;
    private readonly geocodePrecision;
    private readonly geocodeCache;
    private readonly geocodeInFlight;
    constructor(supabaseService: SupabaseService, mailService: MailService);
    private toCoordinateKey;
    private fetchLocationName;
    private resolveLocationName;
    private withLocationNames;
    private getEmployeeId;
    private getUserAttendanceProfile;
    private getCompanyHolidayForDate;
    private getManilaDateString;
    private getManilaWorkdayCode;
    private resolveEffectiveDate;
    private addDaysInManila;
    private getUpdaterName;
    private normalizeWorkdays;
    private isScheduledForDate;
    private parseScheduleTime;
    private buildScheduleWindow;
    private computeClockTypeForTimeIn;
    private computeClockTypeForTimeOut;
    private ensureIsoDate;
    private enumerateDateRange;
    private toManilaTimestamp;
    private createSystemAbsentLog;
    private insertAttendanceAudit;
    private getScheduleForEmployee;
    private getScheduleMapForEmployeesAsOf;
    private getScheduleForToday;
    private getLatestLogForToday;
    timeIn(userId: string, dto: TimePunchDto, req?: any): Promise<{
        log_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        schedule_id: string | null;
        log_type: string;
        clock_type: ClockType | null;
        status: string;
        log_status: string;
        timestamp: string;
        latitude: number | undefined;
        longitude: number | undefined;
        location_name: string | null;
        date: string;
    }>;
    timeOut(userId: string, dto: TimePunchDto, req?: any): Promise<{
        log_id: `${string}-${string}-${string}-${string}-${string}`;
        employee_id: string;
        schedule_id: string | null;
        log_type: string;
        clock_type: ClockType | null;
        status: string;
        log_status: string;
        timestamp: string;
        latitude: number | undefined;
        longitude: number | undefined;
        location_name: string | null;
        date: string;
    }>;
    getMyStatus(userId: string): Promise<{
        date: string;
        current_status: AttendanceLogType | null;
        time_in: (TimeLogRow & {
            location_name: string | null;
        }) | null;
        time_out: (TimeLogRow & {
            location_name: string | null;
        }) | null;
        schedule: {
            sched_id: string;
            workdays: string | string[] | null;
            start_time: string | null;
            end_time: string | null;
            is_nightshift: boolean | null;
        } | null;
    }>;
    getMyTimesheet(userId: string, from?: string, to?: string): Promise<{
        date: string;
        time_in: any;
        time_out: any;
        absence: any;
        absence_request: any;
        all_logs: any[];
    }[]>;
    getEmployeeUsers(companyId: string, asOfDate?: string): Promise<EmployeeUserRow[]>;
    getAllTimesheets(companyId: string, from?: string, to?: string): Promise<(TimeLogRow & {
        location_name: string | null;
    })[]>;
    getEmployeeDetail(targetUserId: string, date: string, companyId: string): Promise<{
        user_id: any;
        employee_id: any;
        first_name: any;
        last_name: any;
        date: string;
        schedule: {
            sched_id: string;
            workdays: string | string[] | null;
            start_time: string | null;
            end_time: string | null;
            break_start: string | null | undefined;
            break_end: string | null | undefined;
            is_nightshift: boolean | null;
        } | null;
        punches: any[];
        attendance_audits: {
            edited_by_name: string | null;
            audit_id: string;
            employee_id: string;
            target_user_id: string;
            date: string;
            edited_by: string | null;
            edited_at: string;
            edit_reason: string;
            before_payload: unknown;
            after_payload: unknown;
        }[];
    }>;
    reportAbsence(userId: string, dto: ReportAbsenceDto, req?: any): Promise<{
        log_id: any;
        log_ids: any[];
        date: string;
        date_from: string;
        date_to: string | undefined;
        days: number;
        reason: import("./dto/report-absence.dto").AbsenceReason;
        notes: string | null;
        latitude: number;
        longitude: number;
    }>;
    getAbsenceRequests(companyId: string, status?: string): Promise<{
        log_id: string;
        employee_id: string | null;
        user_id: string | null;
        first_name: string | null;
        last_name: string | null;
        department_id: string | null;
        department_name: string | null;
        timestamp: string;
        latitude: number | null;
        longitude: number | null;
        location_name: string | null;
        absence_reason: string | null;
        absence_notes: string | null;
        log_status: string;
        reviewed_by: string | null;
        reviewed_at: string | null;
        review_reason: string | null;
    }[]>;
    reviewAbsenceRequest(logId: string, dto: ReviewAbsenceDto, companyId: string, reviewerUserId: string): Promise<{
        user_id: any;
        reviewed_by_name: string;
        log_id: string;
        employee_id: string | null;
        schedule_id: string | null;
        log_type: AttendanceLogType;
        timestamp: string;
        latitude: number | null;
        longitude: number | null;
        ip_address: string | null;
        is_mock_location: boolean;
        clock_type?: ClockType | null;
        status?: string | null;
        log_status: string | null;
        location_name: string | null;
        absence_reason?: string | null;
        absence_notes?: string | null;
        reviewed_by?: string | null;
        reviewed_at?: string | null;
        review_reason?: string | null;
        edited_by?: string | null;
        edited_at?: string | null;
        edit_reason?: string | null;
    }>;
    editAttendanceForDate(targetUserId: string, date: string, dto: EditAttendanceDto, companyId: string, editorUserId: string): Promise<{
        user_id: string;
        employee_id: any;
        date: string;
        punches: (TimeLogRow & {
            location_name: string | null;
        })[];
        message: string;
    }>;
    private hasShiftEndedInManila;
    autoMarkAbsentEmployees(): Promise<{
        date: string;
        marked: number;
        skipped: number;
    }>;
    getCompanyDefaultSchedule(companyId: string): Promise<CompanyDefaultScheduleRow | null>;
    upsertCompanyDefaultSchedule(dto: CompanyDefaultScheduleDto, companyId: string, updaterUserId: string): Promise<CompanyDefaultScheduleRow>;
    private syncCompanyDefaultScheduleRows;
    private findDepartmentBaselineSchedule;
    private findCompanyBaselineSchedule;
    private upsertInheritedSchedule;
    assignInitialScheduleForEmployee(params: {
        companyId: string;
        employeeId: string;
        departmentId?: string | null;
        effectiveDate?: string | null;
        updatedByName?: string | null;
    }): Promise<{
        source: 'department' | 'company-default' | 'company-baseline' | 'preserved-individual' | 'none';
    }>;
    backfillCompanyDefaultSchedule(companyId: string, updaterUserId: string): Promise<{
        affected: number;
    }>;
    upsertEmployeeSchedule(targetUserId: string, dto: UpsertScheduleDto, companyId: string, updaterUserId: string): Promise<ScheduleRow>;
    resetEmployeeScheduleToDepartment(targetUserId: string, dto: ScheduleEffectiveDateDto, companyId: string, updaterUserId: string): Promise<ScheduleRow>;
    resetEmployeeScheduleToCompanyDefault(targetUserId: string, dto: ScheduleEffectiveDateDto, companyId: string, updaterUserId: string): Promise<ScheduleRow>;
    bulkAssignSchedule(dto: BulkScheduleDto, companyId: string, updaterUserId: string): Promise<{
        affected: number;
    }>;
    getEmployeeSchedule(targetUserId: string, companyId: string): Promise<ScheduleRow | null>;
    getAllSchedules(companyId: string): Promise<{
        user_id: string;
        employee_id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        department_id: string | null;
        department_name: string | null;
        schedule: ScheduleRow | null;
    }[]>;
    getMySchedule(userId: string): Promise<ScheduleRow | null>;
    getMyStats(userId: string, from: string, to: string): Promise<{
        attendance_rate: number;
        days_present: number;
        days_late: number;
        days_absent: number;
        hours_worked: number;
    }>;
    private groupByDate;
}
export {};
