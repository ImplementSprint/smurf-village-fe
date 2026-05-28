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
var LeaveAccrualService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveAccrualService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const supabase_1 = require("../../../../libs/supabase/src");
let LeaveAccrualService = LeaveAccrualService_1 = class LeaveAccrualService {
    supabaseService;
    logger = new common_1.Logger(LeaveAccrualService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getConfig(companyId) {
        const { data, error } = await this.supabaseService.getClient()
            .from('leave_config')
            .select('*')
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Leave config not found for this company');
        return data;
    }
    async upsertConfig(companyId, changedBy, patch) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from('leave_config')
            .select('*')
            .eq('company_id', companyId)
            .maybeSingle();
        const { data, error } = await supabase
            .from('leave_config')
            .upsert({ company_id: companyId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'company_id' })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (existing) {
            const logs = Object.entries(patch)
                .filter(([key, val]) => existing[key] !== val)
                .map(([field_changed, new_value]) => ({
                company_id: companyId,
                changed_by: changedBy,
                field_changed,
                old_value: String(existing[field_changed] ?? ''),
                new_value: String(new_value ?? ''),
            }));
            if (logs.length > 0) {
                await supabase.from('leave_config_logs').insert(logs);
            }
        }
        return data;
    }
    async runMonthlyAccrual() {
        this.logger.log('Running monthly leave accrual...');
        const supabase = this.supabaseService.getClient();
        const { data: employees, error: empErr } = await supabase
            .from('user_profile')
            .select('user_id, company_id')
            .eq('account_status', 'Active');
        if (empErr) {
            this.logger.error('Monthly accrual — employee fetch failed', empErr);
            return;
        }
        if (!employees?.length)
            return;
        const companyIds = [...new Set(employees.map(e => e.company_id))];
        const { data: configs, error: cfgErr } = await supabase
            .from('leave_config')
            .select('company_id, accrual_rate')
            .in('company_id', companyIds);
        if (cfgErr) {
            this.logger.error('Monthly accrual — config fetch failed', cfgErr);
            return;
        }
        const configMap = {};
        for (const c of configs ?? [])
            configMap[c.company_id] = Number(c.accrual_rate);
        const LEAVE_TYPES = ['Vacation Leave', 'Sick Leave'];
        let credited = 0;
        for (const emp of employees) {
            const rate = configMap[emp.company_id] ?? 1.5;
            for (const leaveType of LEAVE_TYPES) {
                const { data: balance } = await supabase
                    .from('time_leave_balances')
                    .select('balance_id, allocated_days')
                    .eq('user_id', emp.user_id)
                    .eq('leave_type', leaveType)
                    .maybeSingle();
                if (balance) {
                    await supabase
                        .from('time_leave_balances')
                        .update({ allocated_days: Number(balance.allocated_days) + rate })
                        .eq('balance_id', balance.balance_id);
                }
                else {
                    await supabase.from('time_leave_balances').insert({
                        user_id: emp.user_id,
                        company_id: emp.company_id,
                        leave_type: leaveType,
                        allocated_days: rate,
                        used_days: 0,
                    });
                }
                credited++;
            }
        }
        this.logger.log(`Monthly accrual complete — credited ${credited} balance rows.`);
    }
    async runYearEndCarryOver() {
        this.logger.log('Running year-end leave carry-over...');
        const supabase = this.supabaseService.getClient();
        const { data: configs, error: cfgErr } = await supabase
            .from('leave_config')
            .select('company_id, year_end_rule, carry_over_max');
        if (cfgErr) {
            this.logger.error('Year-end cron — config fetch failed', cfgErr);
            return;
        }
        if (!configs?.length)
            return;
        for (const cfg of configs) {
            const { data: balances } = await supabase
                .from('time_leave_balances')
                .select('balance_id, allocated_days, used_days')
                .eq('company_id', cfg.company_id);
            if (!balances?.length)
                continue;
            for (const bal of balances) {
                const remaining = Math.max(0, Number(bal.allocated_days) - Number(bal.used_days));
                let newAllocated;
                if (cfg.year_end_rule === 'RESET') {
                    newAllocated = 0;
                }
                else if (cfg.year_end_rule === 'CARRY_ALL') {
                    newAllocated = remaining;
                }
                else {
                    newAllocated = Math.min(remaining, cfg.carry_over_max ?? 0);
                }
                await supabase
                    .from('time_leave_balances')
                    .update({ allocated_days: newAllocated, used_days: 0 })
                    .eq('balance_id', bal.balance_id);
            }
            this.logger.log(`Year-end carry-over — company ${cfg.company_id} rule=${cfg.year_end_rule} done.`);
        }
    }
};
exports.LeaveAccrualService = LeaveAccrualService;
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *', { name: 'monthly-leave-accrual' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveAccrualService.prototype, "runMonthlyAccrual", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 1 *', { name: 'year-end-leave-carryover' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveAccrualService.prototype, "runYearEndCarryOver", null);
exports.LeaveAccrualService = LeaveAccrualService = LeaveAccrualService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], LeaveAccrualService);
//# sourceMappingURL=leave-accrual.tasks.js.map