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
exports.CnbController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cnb_service_1 = require("./cnb.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const set_salary_baseline_dto_1 = require("./dto/set-salary-baseline.dto");
const bulk_set_salary_baseline_dto_1 = require("./dto/bulk-set-salary-baseline.dto");
const create_benefit_dto_1 = require("./dto/create-benefit.dto");
const assign_benefit_dto_1 = require("./dto/assign-benefit.dto");
const save_statutory_ids_dto_1 = require("./dto/save-statutory-ids.dto");
const set_tax_bracket_dto_1 = require("./dto/set-tax-bracket.dto");
const update_benefit_catalog_dto_1 = require("./dto/update-benefit-catalog.dto");
const set_statutory_deductions_dto_1 = require("./dto/set-statutory-deductions.dto");
const HR_AND_ABOVE = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Compensation and Benefits Officer',
];
const CNB_OFFICER_AND_ADMIN = [
    'Admin',
    'System Admin',
    'HR Officer',
    'HR Compensation and Benefits Officer',
];
const SYSTEM_ADMIN_ONLY = ['System Admin'];
let CnbController = class CnbController {
    cnbService;
    constructor(cnbService) {
        this.cnbService = cnbService;
    }
    getAllSalaryBaselines(req) {
        return this.cnbService.getAllSalaryBaselines(req.user.company_id);
    }
    getSalaryBaseline(userId, req) {
        return this.cnbService.getSalaryBaseline(userId, req.user.company_id);
    }
    setSalaryBaseline(dto, req) {
        return this.cnbService.setSalaryBaseline({ ...dto, company_id: req.user.company_id }, req.user.sub_userid);
    }
    setBulkSalaryBaselines(dto, req) {
        return this.cnbService.setBulkSalaryBaselines(req.user.company_id, dto.basic_salary, dto.pay_frequency, dto.effective_date, dto.employee_ids, dto.only_missing, req.user.sub_userid);
    }
    getStatutoryConfig(req) {
        return this.cnbService.getBenefitDefaults(req.user.company_id);
    }
    setStatutoryConfig(dto, req) {
        return this.cnbService.setBenefitDefaults(req.user.company_id, dto, req.user.sub_userid);
    }
    getBenefitsCatalog(req) {
        return this.cnbService.getBenefitsCatalog(req.user.company_id);
    }
    createBenefit(dto, req) {
        return this.cnbService.createBenefit({ ...dto, company_id: req.user.company_id }, req.user.sub_userid);
    }
    updateBenefitCatalogItem(benefitId, dto, req) {
        return this.cnbService.updateBenefitCatalogItem(req.user.company_id, benefitId, dto, req.user.sub_userid);
    }
    getEmployeeBenefits(userId, req) {
        return this.cnbService.getEmployeeBenefits(userId, req.user.company_id);
    }
    assignBenefit(dto, req) {
        return this.cnbService.assignBenefit(req.user.company_id, dto, req.user.sub_userid);
    }
    removeEmployeeBenefit(mappingId, req) {
        return this.cnbService.removeEmployeeBenefit(mappingId, req.user.company_id, req.user.sub_userid);
    }
    getBenefitHistory(userId, req) {
        return this.cnbService.getBenefitHistory(userId);
    }
    getStatutoryIds(userId, req) {
        return this.cnbService.getStatutoryIds(userId, req.user.company_id);
    }
    saveStatutoryIds(userId, dto, req) {
        return this.cnbService.saveStatutoryIds(userId, req.user.company_id, dto, req.user.sub_userid);
    }
    getTaxBrackets(req, year) {
        const parsedYear = year ? Number(year) : undefined;
        return this.cnbService.getTaxBrackets(req.user.company_id, parsedYear);
    }
    createTaxBracket(req, dto) {
        return this.cnbService.createTaxBracket(req.user.company_id, dto, req.user.sub_userid);
    }
    deleteTaxBracket(bracketId, req) {
        return this.cnbService.deleteTaxBracket(bracketId, req.user.company_id, req.user.sub_userid);
    }
    reviewPayslip(payslipId, dto, req) {
        return this.cnbService.reviewPayslip(payslipId, dto.status, req.user.sub_userid, req.user.company_id);
    }
    getMyCompensation(req) {
        return this.cnbService.getMyCompensation(req.user.sub_userid, req.user.company_id);
    }
    getMyPayslips(req) {
        return this.cnbService.getMyPayslips(req.user.sub_userid, req.user.company_id);
    }
    getPayslipDetail(payslipId, req) {
        return this.cnbService.getPayslipDetailForUser(payslipId, req.user);
    }
    compute13thMonth(userId, req, year) {
        const parsedYear = year ? Number(year) : new Date().getFullYear();
        return this.cnbService.compute13thMonthPay(userId, req.user.company_id, parsedYear);
    }
    compute13thMonthSelf(req, year) {
        const parsedYear = year ? Number(year) : new Date().getFullYear();
        return this.cnbService.compute13thMonthPay(req.user.sub_userid, req.user.company_id, parsedYear);
    }
    computeSalaryAnnualization(userId, req, annualRatePercent, years, startYear) {
        return this.cnbService.computeSalaryAnnualization(userId, req.user.company_id, annualRatePercent ? Number(annualRatePercent) : 0, years ? Number(years) : 5, startYear ? Number(startYear) : undefined);
    }
    runPayrollCutoff(req, dto) {
        return this.cnbService.runPayrollCutoff(req.user.company_id, dto.cutoff_start_date, dto.cutoff_end_date, dto.payout_date, req.user.sub_userid);
    }
    getPayrollPeriods(req) {
        return this.cnbService.getPayrollPeriods(req.user.company_id);
    }
    getPayslipsForPeriod(periodId, req) {
        return this.cnbService.getPayslipsForPeriod(periodId, req.user.company_id);
    }
    computeSinglePayslip(userId, req, dto) {
        return this.cnbService.computeEmployeePayslip(userId, req.user.company_id, dto.period_id, req.user.sub_userid);
    }
    getMyAnnualPay(req, year) {
        const parsedYear = year ? Number(year) : new Date().getFullYear();
        return this.cnbService.getAnnualNetPay(req.user.sub_userid, req.user.company_id, parsedYear);
    }
    getEmployeeAnnualPay(userId, req, year) {
        const parsedYear = year ? Number(year) : new Date().getFullYear();
        return this.cnbService.getAnnualNetPay(userId, req.user.company_id, parsedYear);
    }
    applyAnnualizationBatch(req, dto) {
        return this.cnbService.applyAnnualizationBatch(req.user.company_id, dto.annual_rate_percent, dto.effective_date, req.user.sub_userid, dto.employee_ids);
    }
    computeRetirement(userId, req) {
        return this.cnbService.computeRetirementBenefit(userId, req.user.company_id);
    }
    computeRetirementSelf(req) {
        return this.cnbService.computeRetirementBenefit(req.user.sub_userid, req.user.company_id);
    }
    getCompanyBranding(req) {
        return this.cnbService.getCompanyBranding(req.user.company_id);
    }
    updateCompanyBranding(req, dto) {
        return this.cnbService.updateCompanyBranding(req.user.company_id, dto, req.user.sub_userid);
    }
};
exports.CnbController = CnbController;
__decorate([
    (0, common_1.Get)('salary-baselines'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest salary baseline for every employee in the company' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getAllSalaryBaselines", null);
__decorate([
    (0, common_1.Get)('salary-baselines/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get salary baseline for an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Salary baseline retrieved',
        schema: {
            example: {
                salary_baseline_id: 'uuid',
                user_id: 'uuid',
                basic_salary: 25000,
                pay_frequency: 'monthly',
                effective_date: '2026-05-01',
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getSalaryBaseline", null);
__decorate([
    (0, common_1.Post)('salary-baselines'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Set or update salary baseline for an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Salary baseline created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_salary_baseline_dto_1.SetSalaryBaselineDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "setSalaryBaseline", null);
__decorate([
    (0, common_1.Post)('salary-baselines/bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Set salary baseline for multiple employees at once',
        description: 'Bulk set salary baselines for all or specific employees. Useful for initial onboarding or mass updates.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Salary baselines created for multiple employees',
        schema: {
            example: {
                count: 25,
                message: 'Salary baselines set for 25 employees',
                results: [
                    {
                        user_id: 'uuid',
                        employee_id: 'emp-001',
                        name: 'John Doe',
                        status: 'success',
                    },
                ],
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_set_salary_baseline_dto_1.BulkSetSalaryBaselineDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "setBulkSalaryBaselines", null);
__decorate([
    (0, common_1.Get)('statutory-deduction-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get SSS/PhilHealth/PAG-IBIG deduction configuration for this company' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getStatutoryConfig", null);
__decorate([
    (0, common_1.Post)('statutory-deduction-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Configure SSS/PhilHealth/PAG-IBIG rates (percentage or fixed amount)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_statutory_deductions_dto_1.SetStatutoryDeductionsDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "setStatutoryConfig", null);
__decorate([
    (0, common_1.Get)('benefits-catalog'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all benefits in the catalog' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getBenefitsCatalog", null);
__decorate([
    (0, common_1.Post)('benefits-catalog'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new benefit type' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Benefit created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_benefit_dto_1.CreateBenefitDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "createBenefit", null);
__decorate([
    (0, common_1.Patch)('benefits-catalog/:benefitId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a benefit catalog item' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benefit catalog item updated',
    }),
    __param(0, (0, common_1.Param)('benefitId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_benefit_catalog_dto_1.UpdateBenefitCatalogDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "updateBenefitCatalogItem", null);
__decorate([
    (0, common_1.Get)('employee-benefits/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all benefits assigned to an employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getEmployeeBenefits", null);
__decorate([
    (0, common_1.Post)('employee-benefits'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a benefit to an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Benefit assigned',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_benefit_dto_1.AssignBenefitDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "assignBenefit", null);
__decorate([
    (0, common_1.Delete)('employee-benefits/:mappingId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a benefit assignment from an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benefit assignment removed',
    }),
    __param(0, (0, common_1.Param)('mappingId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "removeEmployeeBenefit", null);
__decorate([
    (0, common_1.Get)('employee-benefits-history/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get benefit history for an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Benefit history retrieved',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getBenefitHistory", null);
__decorate([
    (0, common_1.Get)('statutory-ids/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get statutory IDs for an employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getStatutoryIds", null);
__decorate([
    (0, common_1.Patch)('statutory-ids/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Save or update statutory IDs for an employee' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statutory IDs updated',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, save_statutory_ids_dto_1.SaveStatutoryIdsDto, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "saveStatutoryIds", null);
__decorate([
    (0, common_1.Get)('tax-brackets'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get tax brackets' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getTaxBrackets", null);
__decorate([
    (0, common_1.Post)('tax-brackets'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tax bracket' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tax bracket created',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_tax_bracket_dto_1.SetTaxBracketDto]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "createTaxBracket", null);
__decorate([
    (0, common_1.Delete)('tax-brackets/:bracketId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tax bracket' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tax bracket deleted',
    }),
    __param(0, (0, common_1.Param)('bracketId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "deleteTaxBracket", null);
__decorate([
    (0, common_1.Patch)('payslips/:payslipId/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Review and approve/reject a payslip' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payslip reviewed',
    }),
    __param(0, (0, common_1.Param)('payslipId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "reviewPayslip", null);
__decorate([
    (0, common_1.Get)('me/compensation'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my compensation summary' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getMyCompensation", null);
__decorate([
    (0, common_1.Get)('me/payslips'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my payslips' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getMyPayslips", null);
__decorate([
    (0, common_1.Get)('payslips/:payslipId'),
    __param(0, (0, common_1.Param)('payslipId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getPayslipDetail", null);
__decorate([
    (0, common_1.Get)('compute/13th-month/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "compute13thMonth", null);
__decorate([
    (0, common_1.Get)('me/compute/13th-month'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "compute13thMonthSelf", null);
__decorate([
    (0, common_1.Get)('salary-baselines/:userId/annualization'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Compute annualized salary growth schedule for an employee' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('annual_rate_percent')),
    __param(3, (0, common_1.Query)('years')),
    __param(4, (0, common_1.Query)('start_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "computeSalaryAnnualization", null);
__decorate([
    (0, common_1.Post)('payroll/run'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "runPayrollCutoff", null);
__decorate([
    (0, common_1.Get)('payroll/periods'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getPayrollPeriods", null);
__decorate([
    (0, common_1.Get)('payroll/periods/:periodId/payslips'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getPayslipsForPeriod", null);
__decorate([
    (0, common_1.Post)('payroll/compute/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "computeSinglePayslip", null);
__decorate([
    (0, common_1.Get)('me/annual-pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my total net pay for the year (aggregated from all payslips)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getMyAnnualPay", null);
__decorate([
    (0, common_1.Get)('annual-pay/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get total net pay for an employee for the year' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getEmployeeAnnualPay", null);
__decorate([
    (0, common_1.Post)('salary-baselines/annualize/batch'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Apply annual salary increase (%) to all employees in the company',
        description: 'Inserts new salary baseline rows with the increased salary effective on the given date. Uses compound growth from the current baseline.',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "applyAnnualizationBatch", null);
__decorate([
    (0, common_1.Get)('compute/retirement/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...CNB_OFFICER_AND_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Compute retirement benefit for an employee',
        description: 'Returns RA 7641 statutory amount vs company policy amount, uses the higher of the two. Requires a benefit of type "retirement" in the benefits catalog for company policy computation.',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "computeRetirement", null);
__decorate([
    (0, common_1.Get)('me/compute/retirement'),
    (0, swagger_1.ApiOperation)({ summary: 'Compute my retirement benefit' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "computeRetirementSelf", null);
__decorate([
    (0, common_1.Get)('company/branding'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company logo, display name, and brand color' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "getCompanyBranding", null);
__decorate([
    (0, common_1.Patch)('company/branding'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...SYSTEM_ADMIN_ONLY),
    (0, swagger_1.ApiOperation)({ summary: 'Update company logo URL, display name, or brand color' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CnbController.prototype, "updateCompanyBranding", null);
exports.CnbController = CnbController = __decorate([
    (0, swagger_1.ApiTags)('Compensation & Benefits'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cnb'),
    __metadata("design:paramtypes", [cnb_service_1.CnbService])
], CnbController);
//# sourceMappingURL=cnb.controller.js.map