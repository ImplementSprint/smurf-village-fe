"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimekeepingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timekeeping_service_1 = require("./timekeeping.service");
const time_punch_dto_1 = require("./dto/time-punch.dto");
const report_absence_dto_1 = require("./dto/report-absence.dto");
const upsert_schedule_dto_1 = require("./dto/upsert-schedule.dto");
const bulk_schedule_dto_1 = require("./dto/bulk-schedule.dto");
const schedule_effective_date_dto_1 = require("./dto/schedule-effective-date.dto");
const company_default_schedule_dto_1 = require("./dto/company-default-schedule.dto");
const review_absence_dto_1 = require("./dto/review-absence.dto");
const edit_attendance_dto_1 = require("./dto/edit-attendance.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'Manager',
];
const SCHEDULE_MANAGERS = [
    'System Admin',
    'HR Officer',
];
let TimekeepingController = class TimekeepingController {
    timekeepingService;
    constructor(timekeepingService) {
        this.timekeepingService = timekeepingService;
    }
    timeIn(dto, req) {
        return this.timekeepingService.timeIn(req.user.sub_userid, dto, req);
    }
    timeOut(dto, req) {
        return this.timekeepingService.timeOut(req.user.sub_userid, dto, req);
    }
    reportAbsence(dto, req) {
        return this.timekeepingService.reportAbsence(req.user.sub_userid, dto, req);
    }
    getAbsenceRequests(req, status) {
        return this.timekeepingService.getAbsenceRequests(req.user.company_id, status);
    }
    reviewAbsenceRequest(logId, dto, req) {
        return this.timekeepingService.reviewAbsenceRequest(logId, dto, req.user.company_id, req.user.sub_userid);
    }
    editAttendance(userId, date, dto, req) {
        return this.timekeepingService.editAttendanceForDate(userId, date, dto, req.user.company_id, req.user.sub_userid);
    }
    autoMarkAbsent() {
        return this.timekeepingService.autoMarkAbsentEmployees();
    }
    getMyStatus(req) {
        return this.timekeepingService.getMyStatus(req.user.sub_userid);
    }
    getMyTimesheet(req, from, to) {
        return this.timekeepingService.getMyTimesheet(req.user.sub_userid, from, to);
    }
    getEmployees(req, asOf) {
        return this.timekeepingService.getEmployeeUsers(req.user.company_id, asOf);
    }
    getAllTimesheets(req, from, to) {
        return this.timekeepingService.getAllTimesheets(req.user.company_id, from, to);
    }
    getEmployeeDetail(userId, date, req) {
        return this.timekeepingService.getEmployeeDetail(userId, date, req.user.company_id);
    }
    getMySchedule(req) {
        return this.timekeepingService.getMySchedule(req.user.sub_userid);
    }
    getMyStats(req, from, to) {
        return this.timekeepingService.getMyStats(req.user.sub_userid, from, to);
    }
    getAllSchedules(req) {
        return this.timekeepingService.getAllSchedules(req.user.company_id);
    }
    getCompanyDefaultSchedule(req) {
        return this.timekeepingService.getCompanyDefaultSchedule(req.user.company_id);
    }
    upsertCompanyDefaultSchedule(dto, req) {
        return this.timekeepingService.upsertCompanyDefaultSchedule(dto, req.user.company_id, req.user.sub_userid);
    }
    backfillCompanyDefaultSchedule(req) {
        return this.timekeepingService.backfillCompanyDefaultSchedule(req.user.company_id, req.user.sub_userid);
    }
    getEmployeeSchedule(userId, req) {
        return this.timekeepingService.getEmployeeSchedule(userId, req.user.company_id);
    }
    upsertSchedule(userId, dto, req) {
        return this.timekeepingService.upsertEmployeeSchedule(userId, dto, req.user.company_id, req.user.sub_userid);
    }
    resetScheduleToDepartment(userId, dto, req) {
        return this.timekeepingService.resetEmployeeScheduleToDepartment(userId, dto, req.user.company_id, req.user.sub_userid);
    }
    resetScheduleToCompanyDefault(userId, dto, req) {
        return this.timekeepingService.resetEmployeeScheduleToCompanyDefault(userId, dto, req.user.company_id, req.user.sub_userid);
    }
    bulkAssignSchedule(dto, req) {
        return this.timekeepingService.bulkAssignSchedule(dto, req.user.company_id, req.user.sub_userid);
    }
};
exports.TimekeepingController = TimekeepingController;
__decorate([
    (0, common_1.Post)('time-in'),
    (0, swagger_1.ApiOperation)({
        summary: 'Employee: Clock in',
        description: 'Records a clock-in punch with GPS coordinates. ' +
            'Rejects duplicate clock-in without a matching clock-out. ' +
            'Requires an assigned work schedule.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_punch_dto_1.TimePunchDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "timeIn", null);
__decorate([
    (0, common_1.Post)('time-out'),
    (0, swagger_1.ApiOperation)({
        summary: 'Employee: Clock out',
        description: 'Records a clock-out punch with GPS coordinates. ' +
            'Rejects if no prior clock-in exists for the current shift/day.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_punch_dto_1.TimePunchDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "timeOut", null);
__decorate([
    (0, common_1.Post)('report-absence'),
    (0, swagger_1.ApiOperation)({
        summary: 'Employee: Report an absence with reason',
        description: 'Records an absence for today with a specified reason. ' +
            'Rejected if the employee has already clocked in or already reported absence today.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_absence_dto_1.ReportAbsenceDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "reportAbsence", null);
__decorate([
    (0, common_1.Get)('absence-requests'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({
        summary: 'HR/System Admin: List employee absence requests',
        description: 'Returns absence entries with review metadata. Defaults to pending if status filter is omitted.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        example: 'PENDING',
        description: 'Optional status filter (PENDING, APPROVED, DENIED, ABSENT).',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getAbsenceRequests", null);
__decorate([
    (0, common_1.Patch)('absence-requests/:logId/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({
        summary: 'HR/System Admin: Approve or deny an absence request',
    }),
    (0, swagger_1.ApiParam)({ name: 'logId', description: 'attendance_time_logs.log_id for absence record' }),
    __param(0, (0, common_1.Param)('logId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_absence_dto_1.ReviewAbsenceDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "reviewAbsenceRequest", null);
__decorate([
    (0, common_1.Patch)('attendance/:userId/:date'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({
        summary: 'HR/System Admin: Edit employee time-in/time-out for a given date',
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the target employee' }),
    (0, swagger_1.ApiParam)({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2026-04-24' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, edit_attendance_dto_1.EditAttendanceDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "editAttendance", null);
__decorate([
    (0, common_1.Post)('auto-mark-absent'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('System Admin', 'HR Officer', 'HR Recruiter', 'HR Interviewer'),
    (0, swagger_1.ApiOperation)({
        summary: 'System: Auto-mark absent employees',
        description: 'Marks all employees scheduled for today as absent if they have ' +
            'no clock-in and did not self-report an absence. ' +
            'Intended to be called at end of business day (or by a cron scheduler). ' +
            'Safe to call multiple times — duplicate absences are skipped. ' +
            'Restricted to HR/System Admin roles.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "autoMarkAbsent", null);
__decorate([
    (0, common_1.Get)('my-status'),
    (0, swagger_1.ApiOperation)({
        summary: "Employee: Get today's punch status",
        description: "Returns the employee's current punch status for today, " +
            'including first clock-in and latest clock-out if present.',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getMyStatus", null);
__decorate([
    (0, common_1.Get)('my-timesheet'),
    (0, swagger_1.ApiOperation)({
        summary: 'Employee: View own timesheet',
        description: "Returns the authenticated employee's punches grouped by date. " +
            'Can be filtered by from/to date.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, example: '2026-03-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, example: '2026-03-31' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getMyTimesheet", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: List employees eligible for timekeeping' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('asOf')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Get)('timesheets'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({
        summary: 'HR/Manager: View all employee timesheets',
        description: "Returns all attendance logs scoped to the requester's company. " +
            'Includes employee details where available.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, example: '2026-03-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, example: '2026-03-31' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getAllTimesheets", null);
__decorate([
    (0, common_1.Get)('timesheets/:userId/:date'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({
        summary: "HR/Manager: View one employee's punches for a specific date",
        description: 'Returns exact clock-in/clock-out records, GPS, IP, and status info ' +
            'for a specific employee on a given date.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'user_id of the target employee',
        example: '8c7ef5ea-1111-2222-3333-444455556666',
    }),
    (0, swagger_1.ApiParam)({
        name: 'date',
        description: 'Date in YYYY-MM-DD format',
        example: '2026-03-10',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getEmployeeDetail", null);
__decorate([
    (0, common_1.Get)('my-schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get own work schedule' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getMySchedule", null);
__decorate([
    (0, common_1.Get)('my-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee: Get attendance stats for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: true, example: '2026-04-01' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: true, example: '2026-04-30' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getMyStats", null);
__decorate([
    (0, common_1.Get)('schedules'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Get all employees with their assigned schedules' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getAllSchedules", null);
__decorate([
    (0, common_1.Get)('schedules/company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR/System Admin: Get the company default schedule for new employees' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getCompanyDefaultSchedule", null);
__decorate([
    (0, common_1.Put)('schedules/company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/System Admin: Create or update the company default schedule for new employees' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_default_schedule_dto_1.CompanyDefaultScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "upsertCompanyDefaultSchedule", null);
__decorate([
    (0, common_1.Post)('schedules/company-default/backfill'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/System Admin: Apply company default schedule to unscheduled employees without a department' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "backfillCompanyDefaultSchedule", null);
__decorate([
    (0, common_1.Get)('employees/:userId/schedule'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({ summary: 'HR/Manager: Get a specific employee\'s schedule' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the target employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "getEmployeeSchedule", null);
__decorate([
    (0, common_1.Put)('employees/:userId/schedule'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/System Admin: Create or update an employee\'s schedule' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the target employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_schedule_dto_1.UpsertScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "upsertSchedule", null);
__decorate([
    (0, common_1.Post)('employees/:userId/schedule/reset-department'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({
        summary: "HR/System Admin: Reset an employee's custom schedule back to the department's standard schedule",
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the target employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, schedule_effective_date_dto_1.ScheduleEffectiveDateDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "resetScheduleToDepartment", null);
__decorate([
    (0, common_1.Post)('employees/:userId/schedule/reset-company-default'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({
        summary: "HR/System Admin: Reset an employee's custom schedule back to the whole company default schedule",
    }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'user_id of the target employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, schedule_effective_date_dto_1.ScheduleEffectiveDateDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "resetScheduleToCompanyDefault", null);
__decorate([
    (0, common_1.Post)('schedules/bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SCHEDULE_MANAGERS),
    (0, swagger_1.ApiOperation)({ summary: 'HR/System Admin: Bulk-assign a schedule to company, department, or selected employees' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_schedule_dto_1.BulkScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], TimekeepingController.prototype, "bulkAssignSchedule", null);
exports.TimekeepingController = TimekeepingController = __decorate([
    (0, swagger_1.ApiTags)('Timekeeping'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('timekeeping'),
    __metadata("design:paramtypes", [timekeeping_service_1.TimekeepingService])
], TimekeepingController);
//# sourceMappingURL=timekeeping.controller.js.map