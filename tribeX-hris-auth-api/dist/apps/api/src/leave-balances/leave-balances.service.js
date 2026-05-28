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
var LeaveBalancesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalancesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../../../../libs/supabase/src");
const leave_categories_1 = require("./leave-categories");
let LeaveBalancesService = LeaveBalancesService_1 = class LeaveBalancesService {
    supabaseService;
    logger = new common_1.Logger(LeaveBalancesService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    get db() {
        return this.supabaseService.getClient();
    }
    async resolveEmployeeId(userId) {
        const { data } = await this.db
            .from('user_profile')
            .select('employee_id')
            .eq('user_id', userId)
            .maybeSingle();
        return data?.employee_id ?? null;
    }
    async resolveCompanyForEmployee(employeeId) {
        const { data } = await this.db
            .from('user_profile')
            .select('company_id')
            .eq('employee_id', employeeId)
            .maybeSingle();
        return data?.company_id ?? null;
    }
    async getUpdaterName(userId) {
        if (!userId)
            return null;
        const { data } = await this.db
            .from('user_profile')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .maybeSingle();
        return data ? `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || null : null;
    }
    async getEmployeesForCompany(companyId) {
        const { data } = await this.db
            .from('user_profile')
            .select('user_id, employee_id, department_id')
            .eq('company_id', companyId)
            .not('employee_id', 'is', null);
        return (data ?? []);
    }
    get currentYear() {
        return new Date().getFullYear();
    }
    async getUserIdByEmployeeId(employeeId) {
        const { data } = await this.db
            .from('user_profile')
            .select('user_id')
            .eq('employee_id', employeeId)
            .maybeSingle();
        return data?.user_id ?? null;
    }
    async getTimeBalancesByUser(userId, companyId, year = this.currentYear) {
        const { data } = await this.db
            .from('time_leave_balances')
            .select('user_id, company_id, leave_type, year, allocated_days, used_days')
            .eq('user_id', userId)
            .eq('company_id', companyId)
            .eq('year', year);
        const map = new Map();
        for (const row of (data ?? [])) {
            map.set(row.leave_type, row);
        }
        return map;
    }
    async upsertTimeBalanceAllocated(params) {
        const year = params.year ?? this.currentYear;
        const { data: existing } = await this.db
            .from('time_leave_balances')
            .select('balance_id, used_days')
            .eq('user_id', params.userId)
            .eq('company_id', params.companyId)
            .eq('leave_type', params.leaveType)
            .eq('year', year)
            .maybeSingle();
        if (existing?.balance_id) {
            await this.db
                .from('time_leave_balances')
                .update({
                allocated_days: params.allocatedDays,
                updated_at: new Date().toISOString(),
            })
                .eq('balance_id', existing.balance_id);
            return;
        }
        await this.db.from('time_leave_balances').insert({
            user_id: params.userId,
            company_id: params.companyId,
            leave_type: params.leaveType,
            year,
            allocated_days: params.allocatedDays,
            used_days: 0,
        });
    }
    async getEmployeeDepartmentId(employeeId) {
        const { data } = await this.db
            .from('user_profile')
            .select('department_id')
            .eq('employee_id', employeeId)
            .maybeSingle();
        return data?.department_id ?? null;
    }
    async getDepartmentDefaultsMap(companyId, departmentId) {
        const { data, error } = await this.db
            .from('leave_balance_department_defaults')
            .select('*')
            .eq('company_id', companyId)
            .eq('department_id', departmentId);
        if (error) {
            const msg = String(error.message ?? '');
            if (msg.includes('leave_balance_department_defaults')) {
                this.logger.warn('leave_balance_department_defaults table is unavailable. Returning empty department defaults.');
                return new Map();
            }
            throw new Error(error.message);
        }
        return new Map((data ?? []).map((r) => [r.leave_category, Number(r.default_days ?? 0)]));
    }
    async getCompanyDefaults(companyId) {
        const { data, error } = await this.db
            .from('leave_balance_company_defaults')
            .select('*')
            .eq('company_id', companyId);
        if (error)
            throw new Error(error.message);
        const existing = new Map((data ?? []).map((r) => [r.leave_category, r]));
        return leave_categories_1.LEAVE_CATEGORIES.map((cat) => existing.get(cat) ?? {
            company_id: companyId,
            leave_category: cat,
            default_days: 0,
            updated_by: null,
            updated_by_name: null,
            updated_at: null,
        });
    }
    async upsertCompanyDefaults(companyId, dto, updaterUserId) {
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const rows = dto.items.map((item) => ({
            company_id: companyId,
            leave_category: item.leave_category,
            default_days: item.default_days,
            updated_by: updaterUserId ?? null,
            updated_by_name: updaterName,
            updated_at: now,
        }));
        const { error } = await this.db
            .from('leave_balance_company_defaults')
            .upsert(rows, { onConflict: 'company_id,leave_category' });
        if (error)
            throw new Error(error.message);
        await this.syncDefaultSourcedEmployees(companyId, dto, updaterUserId);
        return this.getCompanyDefaults(companyId);
    }
    async getDepartmentDefaults(companyId, departmentId) {
        const existing = await this.getDepartmentDefaultsMap(companyId, departmentId);
        return leave_categories_1.LEAVE_CATEGORIES.map((cat) => ({
            company_id: companyId,
            department_id: departmentId,
            leave_category: cat,
            default_days: existing.get(cat) ?? 0,
        }));
    }
    async upsertDepartmentDefaults(companyId, departmentId, dto, updaterUserId) {
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const rows = dto.items.map((item) => ({
            company_id: companyId,
            department_id: departmentId,
            leave_category: item.leave_category,
            default_days: item.default_days,
            updated_by: updaterUserId ?? null,
            updated_by_name: updaterName,
            updated_at: now,
        }));
        const { error } = await this.db
            .from('leave_balance_department_defaults')
            .upsert(rows, { onConflict: 'department_id,leave_category' });
        if (error) {
            const msg = String(error.message ?? '');
            if (msg.includes('leave_balance_department_defaults')) {
                throw new Error('Department leave defaults table is missing. Please run SQL migration 2026-05-18_leave_balance_department_defaults.sql first.');
            }
            throw new Error(error.message);
        }
        await this.syncDepartmentSourcedEmployees(companyId, departmentId, dto, updaterUserId);
        return this.getDepartmentDefaults(companyId, departmentId);
    }
    async syncDepartmentSourcedEmployees(companyId, departmentId, dto, updaterUserId) {
        const { data: employees } = await this.db
            .from('user_profile')
            .select('employee_id')
            .eq('company_id', companyId)
            .eq('department_id', departmentId)
            .not('employee_id', 'is', null);
        const empIds = (employees ?? []).map((e) => e.employee_id);
        if (!empIds.length)
            return;
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const { data: existingRows } = await this.db
            .from('employee_leave_balances')
            .select('employee_id, leave_category, used_days, balance_source')
            .in('employee_id', empIds);
        const existingMap = new Map();
        for (const row of existingRows ?? []) {
            const r = row;
            existingMap.set(`${r.employee_id}::${r.leave_category}`, {
                used_days: Number(r.used_days ?? 0),
                balance_source: String(r.balance_source ?? 'default'),
            });
        }
        const rows = [];
        for (const empId of empIds) {
            for (const item of dto.items) {
                const key = `${empId}::${item.leave_category}`;
                const existing = existingMap.get(key);
                if (existing?.balance_source === 'individual')
                    continue;
                rows.push({
                    employee_id: empId,
                    company_id: companyId,
                    leave_category: item.leave_category,
                    entitled_days: item.default_days,
                    used_days: existing?.used_days ?? 0,
                    balance_source: 'bulk',
                    updated_by: updaterUserId ?? null,
                    updated_by_name: updaterName,
                    updated_at: now,
                });
            }
        }
        if (!rows.length)
            return;
        const { error } = await this.db
            .from('employee_leave_balances')
            .upsert(rows, { onConflict: 'employee_id,leave_category' });
        if (error)
            throw new Error(error.message);
        for (const row of rows) {
            const userId = await this.getUserIdByEmployeeId(row.employee_id);
            if (!userId)
                continue;
            await this.upsertTimeBalanceAllocated({
                userId,
                companyId,
                leaveType: row.leave_category,
                allocatedDays: Number(row.entitled_days ?? 0),
            });
        }
    }
    async syncDefaultSourcedEmployees(companyId, dto, updaterUserId) {
        const employees = await this.getEmployeesForCompany(companyId);
        if (!employees.length)
            return;
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        for (const emp of employees) {
            for (const item of dto.items) {
                await this.db
                    .from('employee_leave_balances')
                    .update({
                    entitled_days: item.default_days,
                    updated_by: updaterUserId ?? null,
                    updated_by_name: updaterName,
                    updated_at: now,
                })
                    .eq('employee_id', emp.employee_id)
                    .eq('leave_category', item.leave_category)
                    .eq('balance_source', 'default');
                await this.upsertTimeBalanceAllocated({
                    userId: emp.user_id,
                    companyId,
                    leaveType: item.leave_category,
                    allocatedDays: item.default_days,
                });
            }
        }
    }
    async backfillCompanyDefaults(companyId, updaterUserId) {
        const defaults = await this.getCompanyDefaults(companyId);
        const employees = await this.getEmployeesForCompany(companyId);
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        let count = 0;
        for (const emp of employees) {
            for (const def of defaults) {
                const { data: existing } = await this.db
                    .from('employee_leave_balances')
                    .select('balance_source')
                    .eq('employee_id', emp.employee_id)
                    .eq('leave_category', def.leave_category)
                    .maybeSingle();
                if (!existing) {
                    await this.db.from('employee_leave_balances').insert({
                        employee_id: emp.employee_id,
                        company_id: companyId,
                        leave_category: def.leave_category,
                        entitled_days: def.default_days ?? 0,
                        used_days: 0,
                        balance_source: 'default',
                        updated_by: updaterUserId ?? null,
                        updated_by_name: updaterName,
                        updated_at: now,
                    });
                    count++;
                }
                await this.upsertTimeBalanceAllocated({
                    userId: emp.user_id,
                    companyId,
                    leaveType: def.leave_category,
                    allocatedDays: Number(def.default_days ?? 0),
                });
            }
        }
        return { backfilled: count };
    }
    async reconcileCompanyBalances(companyId, updaterUserId) {
        const employees = await this.getEmployeesForCompany(companyId);
        if (!employees.length)
            return { employees: 0, categories_upserted: 0 };
        const defaults = await this.getCompanyDefaults(companyId);
        const defaultMap = new Map(defaults.map((d) => [d.leave_category, Number(d.default_days ?? 0)]));
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const year = this.currentYear;
        let categoriesUpserted = 0;
        for (const emp of employees) {
            const [deptDefaults, existingRows, timeRows] = await Promise.all([
                emp.department_id
                    ? this.getDepartmentDefaultsMap(companyId, emp.department_id)
                    : Promise.resolve(new Map()),
                this.db
                    .from('employee_leave_balances')
                    .select('leave_category, entitled_days, used_days, balance_source')
                    .eq('employee_id', emp.employee_id)
                    .eq('company_id', companyId),
                this.db
                    .from('time_leave_balances')
                    .select('leave_type, allocated_days, used_days')
                    .eq('user_id', emp.user_id)
                    .eq('company_id', companyId)
                    .eq('year', year),
            ]);
            const existingMap = new Map((existingRows.data ?? []).map((r) => [r.leave_category, r]));
            const timeMap = new Map((timeRows.data ?? []).map((r) => [r.leave_type, r]));
            const employeeRows = [];
            const timeUpserts = [];
            for (const cat of leave_categories_1.LEAVE_CATEGORIES) {
                const existing = existingMap.get(cat);
                const time = timeMap.get(cat);
                const baselineEntitled = emp.department_id && deptDefaults.has(cat)
                    ? Number(deptDefaults.get(cat) ?? 0)
                    : Number(defaultMap.get(cat) ?? 0);
                const source = existing?.balance_source === 'individual'
                    ? 'individual'
                    : emp.department_id && deptDefaults.has(cat)
                        ? 'bulk'
                        : 'default';
                const entitled = source === 'individual'
                    ? Number(existing?.entitled_days ?? baselineEntitled)
                    : baselineEntitled;
                const used = Math.max(Number(existing?.used_days ?? 0), Number(time?.used_days ?? 0));
                employeeRows.push({
                    employee_id: emp.employee_id,
                    company_id: companyId,
                    leave_category: cat,
                    entitled_days: entitled,
                    used_days: used,
                    balance_source: source,
                    updated_by: updaterUserId ?? null,
                    updated_by_name: updaterName,
                    updated_at: now,
                });
                timeUpserts.push({
                    user_id: emp.user_id,
                    company_id: companyId,
                    leave_type: cat,
                    year,
                    allocated_days: entitled,
                    used_days: used,
                    updated_at: now,
                });
            }
            const { error: balErr } = await this.db
                .from('employee_leave_balances')
                .upsert(employeeRows, { onConflict: 'employee_id,leave_category' });
            if (balErr)
                throw new Error(balErr.message);
            for (const row of timeUpserts) {
                const { data: existingTime, error: readErr } = await this.db
                    .from('time_leave_balances')
                    .select('balance_id')
                    .eq('user_id', row.user_id)
                    .eq('company_id', row.company_id)
                    .eq('leave_type', row.leave_type)
                    .eq('year', row.year)
                    .maybeSingle();
                if (readErr)
                    throw new Error(readErr.message);
                if (existingTime?.balance_id) {
                    const { error: updateErr } = await this.db
                        .from('time_leave_balances')
                        .update({
                        allocated_days: row.allocated_days,
                        used_days: row.used_days,
                        updated_at: row.updated_at,
                    })
                        .eq('balance_id', existingTime.balance_id);
                    if (updateErr)
                        throw new Error(updateErr.message);
                }
                else {
                    const { error: insertErr } = await this.db.from('time_leave_balances').insert({
                        user_id: row.user_id,
                        company_id: row.company_id,
                        leave_type: row.leave_type,
                        year: row.year,
                        allocated_days: row.allocated_days,
                        used_days: row.used_days,
                        updated_at: row.updated_at,
                    });
                    if (insertErr)
                        throw new Error(insertErr.message);
                }
            }
            categoriesUpserted += employeeRows.length;
        }
        return { employees: employees.length, categories_upserted: categoriesUpserted };
    }
    async getRoster(companyId) {
        const employees = await this.getEmployeesForCompany(companyId);
        if (!employees.length)
            return [];
        const empIds = employees.map((e) => e.employee_id);
        const { data: rows, error } = await this.db
            .from('employee_leave_balances')
            .select('*')
            .in('employee_id', empIds);
        if (error)
            throw new Error(error.message);
        const { data: profiles } = await this.db
            .from('user_profile')
            .select('user_id, employee_id, first_name, last_name, department_id')
            .in('employee_id', empIds);
        const profileMap = new Map((profiles ?? []).map((p) => [p.employee_id, p]));
        const balanceMap = new Map();
        for (const row of rows ?? []) {
            const r = row;
            if (!balanceMap.has(r.employee_id))
                balanceMap.set(r.employee_id, new Map());
            balanceMap.get(r.employee_id).set(r.leave_category, r);
        }
        const userIds = employees.map((e) => e.user_id);
        const { data: timeRows } = await this.db
            .from('time_leave_balances')
            .select('user_id, company_id, leave_type, year, allocated_days, used_days')
            .in('user_id', userIds)
            .eq('company_id', companyId)
            .eq('year', this.currentYear);
        const timeMap = new Map();
        for (const row of (timeRows ?? [])) {
            if (!timeMap.has(row.user_id))
                timeMap.set(row.user_id, new Map());
            timeMap.get(row.user_id).set(row.leave_type, row);
        }
        return employees.map((emp) => {
            const profile = profileMap.get(emp.employee_id);
            const catMap = balanceMap.get(emp.employee_id) ?? new Map();
            const userTimeMap = timeMap.get(emp.user_id) ?? new Map();
            const categories = leave_categories_1.LEAVE_CATEGORIES.map((cat) => {
                const b = catMap.get(cat);
                const t = userTimeMap.get(cat);
                const entitled = t
                    ? Number(t.allocated_days)
                    : Number(b?.entitled_days ?? 0);
                const used = t
                    ? Number(t.used_days)
                    : Number(b?.used_days ?? 0);
                return {
                    leave_category: cat,
                    entitled_days: entitled,
                    used_days: used,
                    remaining_days: entitled - used,
                    balance_source: b?.balance_source ?? 'default',
                };
            });
            return {
                employee_id: emp.employee_id,
                user_id: emp.user_id,
                first_name: profile?.first_name ?? null,
                last_name: profile?.last_name ?? null,
                department_id: emp.department_id,
                categories,
            };
        });
    }
    async getEmployeeBalances(userId, companyId) {
        const employeeId = await this.resolveEmployeeId(userId);
        if (!employeeId)
            return { employee_id: null, categories: [] };
        const { data, error } = await this.db
            .from('employee_leave_balances')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId);
        if (error)
            throw new Error(error.message);
        const rowMap = new Map((data ?? []).map((r) => [r.leave_category, r]));
        const timeMap = await this.getTimeBalancesByUser(userId, companyId);
        const categories = leave_categories_1.LEAVE_CATEGORIES.map((cat) => {
            const b = rowMap.get(cat);
            const t = timeMap.get(cat);
            const entitled = t
                ? Number(t.allocated_days)
                : Number(b?.entitled_days ?? 0);
            const used = t
                ? Number(t.used_days)
                : Number(b?.used_days ?? 0);
            return {
                leave_category: cat,
                entitled_days: entitled,
                used_days: used,
                remaining_days: entitled - used,
                balance_source: b?.balance_source ?? 'default',
                updated_by_name: b?.updated_by_name ?? null,
                updated_at: b?.updated_at ?? null,
            };
        });
        return { employee_id: employeeId, categories };
    }
    async getMyBalances(userId) {
        const employeeId = await this.resolveEmployeeId(userId);
        if (!employeeId)
            return { categories: [] };
        const companyId = await this.resolveCompanyForEmployee(employeeId);
        if (!companyId)
            return { categories: [] };
        return this.getEmployeeBalances(userId, companyId);
    }
    async upsertEmployeeBalances(userId, companyId, dto, updaterUserId) {
        const employeeId = await this.resolveEmployeeId(userId);
        if (!employeeId)
            throw new Error('Employee profile not found.');
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const { data: existing } = await this.db
            .from('employee_leave_balances')
            .select('leave_category, used_days')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId);
        const usedMap = new Map((existing ?? []).map((r) => [r.leave_category, Number(r.used_days)]));
        const rows = dto.items.map((item) => ({
            employee_id: employeeId,
            company_id: companyId,
            leave_category: item.leave_category,
            entitled_days: item.entitled_days,
            used_days: usedMap.get(item.leave_category) ?? 0,
            balance_source: 'individual',
            updated_by: updaterUserId ?? null,
            updated_by_name: updaterName,
            updated_at: now,
        }));
        const { error } = await this.db
            .from('employee_leave_balances')
            .upsert(rows, { onConflict: 'employee_id,leave_category' });
        if (error)
            throw new Error(error.message);
        for (const item of dto.items) {
            await this.upsertTimeBalanceAllocated({
                userId,
                companyId,
                leaveType: item.leave_category,
                allocatedDays: item.entitled_days,
            });
        }
        return this.getEmployeeBalances(userId, companyId);
    }
    async resetToDepartment(userId, companyId, updaterUserId) {
        const employeeId = await this.resolveEmployeeId(userId);
        if (!employeeId)
            throw new Error('Employee profile not found.');
        const { data: profile } = await this.db
            .from('user_profile')
            .select('department_id')
            .eq('employee_id', employeeId)
            .maybeSingle();
        const departmentId = profile?.department_id ?? null;
        const baseline = new Map();
        if (departmentId) {
            const deptDefaults = await this.getDepartmentDefaultsMap(companyId, departmentId);
            for (const [cat, days] of deptDefaults.entries())
                baseline.set(cat, days);
        }
        const defaults = await this.getCompanyDefaults(companyId);
        for (const def of defaults) {
            if (!baseline.has(def.leave_category)) {
                baseline.set(def.leave_category, def.default_days ?? 0);
            }
        }
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const { data: existing } = await this.db
            .from('employee_leave_balances')
            .select('leave_category, used_days')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId);
        const usedMap = new Map((existing ?? []).map((r) => [r.leave_category, Number(r.used_days)]));
        const rows = leave_categories_1.LEAVE_CATEGORIES.map((cat) => ({
            employee_id: employeeId,
            company_id: companyId,
            leave_category: cat,
            entitled_days: baseline.get(cat) ?? 0,
            used_days: usedMap.get(cat) ?? 0,
            balance_source: departmentId ? 'bulk' : 'default',
            updated_by: updaterUserId ?? null,
            updated_by_name: updaterName,
            updated_at: now,
        }));
        const { error } = await this.db
            .from('employee_leave_balances')
            .upsert(rows, { onConflict: 'employee_id,leave_category' });
        if (error)
            throw new Error(error.message);
        for (const cat of leave_categories_1.LEAVE_CATEGORIES) {
            await this.upsertTimeBalanceAllocated({
                userId,
                companyId,
                leaveType: cat,
                allocatedDays: baseline.get(cat) ?? 0,
            });
        }
        return this.getEmployeeBalances(userId, companyId);
    }
    async resetToCompanyDefault(userId, companyId, updaterUserId) {
        const employeeId = await this.resolveEmployeeId(userId);
        if (!employeeId)
            throw new Error('Employee profile not found.');
        const defaults = await this.getCompanyDefaults(companyId);
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        const { data: existing } = await this.db
            .from('employee_leave_balances')
            .select('leave_category, used_days')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId);
        const usedMap = new Map((existing ?? []).map((r) => [r.leave_category, Number(r.used_days)]));
        const rows = defaults.map((def) => ({
            employee_id: employeeId,
            company_id: companyId,
            leave_category: def.leave_category,
            entitled_days: def.default_days ?? 0,
            used_days: usedMap.get(def.leave_category) ?? 0,
            balance_source: 'default',
            updated_by: updaterUserId ?? null,
            updated_by_name: updaterName,
            updated_at: now,
        }));
        const { error } = await this.db
            .from('employee_leave_balances')
            .upsert(rows, { onConflict: 'employee_id,leave_category' });
        if (error)
            throw new Error(error.message);
        for (const def of defaults) {
            await this.upsertTimeBalanceAllocated({
                userId,
                companyId,
                leaveType: def.leave_category,
                allocatedDays: Number(def.default_days ?? 0),
            });
        }
        return this.getEmployeeBalances(userId, companyId);
    }
    async bulkAssign(companyId, dto, updaterUserId) {
        const updaterName = await this.getUpdaterName(updaterUserId ?? null);
        const now = new Date().toISOString();
        let employeeIds = [];
        if (dto.scope === 'company') {
            const emps = await this.getEmployeesForCompany(companyId);
            employeeIds = emps.map((e) => e.employee_id);
        }
        else if (dto.scope === 'department' && dto.department_id) {
            const { data } = await this.db
                .from('user_profile')
                .select('employee_id')
                .eq('company_id', companyId)
                .eq('department_id', dto.department_id)
                .not('employee_id', 'is', null);
            employeeIds = (data ?? []).map((r) => r.employee_id);
        }
        else if (dto.scope === 'employees' && dto.user_ids?.length) {
            const { data } = await this.db
                .from('user_profile')
                .select('employee_id')
                .eq('company_id', companyId)
                .in('user_id', dto.user_ids)
                .not('employee_id', 'is', null);
            employeeIds = (data ?? []).map((r) => r.employee_id);
        }
        if (!employeeIds.length)
            return { assigned: 0 };
        const { data: existing } = await this.db
            .from('employee_leave_balances')
            .select('employee_id, leave_category, used_days')
            .in('employee_id', employeeIds);
        const usedMap = new Map();
        for (const row of existing ?? []) {
            usedMap.set(`${row.employee_id}::${row.leave_category}`, Number(row.used_days));
        }
        const rows = [];
        for (const empId of employeeIds) {
            for (const item of dto.items) {
                rows.push({
                    employee_id: empId,
                    company_id: companyId,
                    leave_category: item.leave_category,
                    entitled_days: item.entitled_days,
                    used_days: usedMap.get(`${empId}::${item.leave_category}`) ?? 0,
                    balance_source: dto.scope === 'company' ? 'default' : 'bulk',
                    updated_by: updaterUserId ?? null,
                    updated_by_name: updaterName,
                    updated_at: now,
                });
            }
        }
        const { error } = await this.db
            .from('employee_leave_balances')
            .upsert(rows, { onConflict: 'employee_id,leave_category' });
        if (error)
            throw new Error(error.message);
        for (const row of rows) {
            const userId = await this.getUserIdByEmployeeId(row.employee_id);
            if (!userId)
                continue;
            await this.upsertTimeBalanceAllocated({
                userId,
                companyId,
                leaveType: row.leave_category,
                allocatedDays: Number(row.entitled_days ?? 0),
            });
        }
        return { assigned: employeeIds.length };
    }
    async deductLeaveBalance(employeeId, companyId, leaveCategory, days) {
        const { data: row, error: fetchErr } = await this.db
            .from('employee_leave_balances')
            .select('entitled_days, used_days')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId)
            .eq('leave_category', leaveCategory)
            .maybeSingle();
        if (fetchErr)
            throw new Error(fetchErr.message);
        const entitled = Number(row?.entitled_days ?? 0);
        const used = Number(row?.used_days ?? 0);
        const remaining = entitled - used;
        if (remaining < days) {
            throw new Error(`Insufficient ${leaveCategory} balance: ${remaining} day(s) remaining, ${days} requested.`);
        }
        const { error: updateErr } = await this.db
            .from('employee_leave_balances')
            .update({ used_days: used + days, updated_at: new Date().toISOString() })
            .eq('employee_id', employeeId)
            .eq('leave_category', leaveCategory);
        if (updateErr)
            throw new Error(updateErr.message);
    }
    async assignInitialLeaveBalancesForEmployee(params) {
        const { companyId, employeeId, departmentId, updatedByName } = params;
        const now = new Date().toISOString();
        const { data: existingRows } = await this.db
            .from('employee_leave_balances')
            .select('leave_category, balance_source, entitled_days, used_days')
            .eq('employee_id', employeeId)
            .eq('company_id', companyId);
        const existing = new Map((existingRows ?? []).map((r) => [r.leave_category, r]));
        const resolvedDepartmentId = departmentId ?? (await this.getEmployeeDepartmentId(employeeId));
        const deptBaseline = resolvedDepartmentId
            ? await this.getDepartmentDefaultsMap(companyId, resolvedDepartmentId)
            : null;
        const defaults = await this.getCompanyDefaults(companyId);
        const defaultMap = new Map(defaults.map((d) => [d.leave_category, Number(d.default_days)]));
        const rows = [];
        let source = 'default';
        for (const cat of leave_categories_1.LEAVE_CATEGORIES) {
            const existingRow = existing.get(cat);
            if (existingRow?.balance_source === 'individual')
                continue;
            const existingUsed = existingRow ? Number(existingRow.used_days) : 0;
            if (resolvedDepartmentId && deptBaseline?.has(cat)) {
                rows.push({
                    employee_id: employeeId,
                    company_id: companyId,
                    leave_category: cat,
                    entitled_days: deptBaseline.get(cat),
                    used_days: existingUsed,
                    balance_source: 'bulk',
                    updated_by_name: updatedByName ?? null,
                    updated_at: now,
                });
                source = 'bulk';
            }
            else {
                rows.push({
                    employee_id: employeeId,
                    company_id: companyId,
                    leave_category: cat,
                    entitled_days: defaultMap.get(cat) ?? 0,
                    used_days: existingUsed,
                    balance_source: 'default',
                    updated_by_name: updatedByName ?? null,
                    updated_at: now,
                });
            }
        }
        if (rows.length) {
            const { error } = await this.db
                .from('employee_leave_balances')
                .upsert(rows, { onConflict: 'employee_id,leave_category' });
            if (error)
                this.logger.warn(`assignInitialLeaveBalances error: ${error.message}`);
            const userId = await this.getUserIdByEmployeeId(employeeId);
            if (userId) {
                for (const row of rows) {
                    await this.upsertTimeBalanceAllocated({
                        userId,
                        companyId,
                        leaveType: row.leave_category,
                        allocatedDays: Number(row.entitled_days ?? 0),
                    });
                }
            }
        }
        return { source };
    }
};
exports.LeaveBalancesService = LeaveBalancesService;
exports.LeaveBalancesService = LeaveBalancesService = LeaveBalancesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService])
], LeaveBalancesService);
//# sourceMappingURL=leave-balances.service.js.map