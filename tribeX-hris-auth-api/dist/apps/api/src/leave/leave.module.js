"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModule = void 0;
const common_1 = require("@nestjs/common");
const leave_controller_1 = require("./leave.controller");
const leave_service_1 = require("./leave.service");
const leave_accrual_tasks_1 = require("./leave-accrual.tasks");
const supabase_1 = require("../../../../libs/supabase/src");
const auth_module_1 = require("../auth/auth.module");
const mail_module_1 = require("../mail/mail.module");
const leave_balances_module_1 = require("../leave-balances/leave-balances.module");
let LeaveModule = class LeaveModule {
};
exports.LeaveModule = LeaveModule;
exports.LeaveModule = LeaveModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_1.SupabaseModule, auth_module_1.AuthModule, mail_module_1.MailModule, leave_balances_module_1.LeaveBalancesModule],
        controllers: [leave_controller_1.LeaveController],
        providers: [leave_service_1.LeaveService, leave_accrual_tasks_1.LeaveAccrualService],
        exports: [leave_service_1.LeaveService],
    })
], LeaveModule);
//# sourceMappingURL=leave.module.js.map