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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const run_payroll_cutoff_dto_1 = require("./dto/run-payroll-cutoff.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Compensation and Benefits Officer',
];
let PayrollController = class PayrollController {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    getMyPayslips(req) {
        return this.payrollService.getMyPayslips(req.user.sub_userid);
    }
    getPayrollLedger(req, cutoff) {
        return this.payrollService.getPayrollLedger(req.user.company_id, cutoff);
    }
    runPayrollCutoff(req, dto) {
        return this.payrollService.runPayrollCutoff(req.user.company_id, req.user.sub_userid, dto.cutoff_date);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('me/payslips'),
    (0, swagger_1.ApiOperation)({
        summary: 'Employee: Get own payslips',
        description: 'Returns all payslips for the authenticated employee, newest first.',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getMyPayslips", null);
__decorate([
    (0, common_1.Get)('ledger'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({
        summary: 'HR: Get payroll ledger for a cutoff date',
        description: 'Returns all payslip entries for the specified payout/cutoff date. ' +
            'If cutoff is omitted, returns the most recent period.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'cutoff', required: false, example: '2026-03-31' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('cutoff')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getPayrollLedger", null);
__decorate([
    (0, common_1.Post)('cutoff/run'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...HR_AND_ABOVE),
    (0, swagger_1.ApiOperation)({
        summary: 'HR: Run payroll for a cutoff date',
        description: 'Generates payslips for all active employees for the given cutoff date. ' +
            'Creates or updates the cnb_payroll_periods record and marks it Processed.',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, run_payroll_cutoff_dto_1.RunPayrollCutoffDto]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "runPayrollCutoff", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map