"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimekeepingModule = void 0;
const common_1 = require("@nestjs/common");
const timekeeping_controller_1 = require("./timekeeping.controller");
const timekeeping_service_1 = require("./timekeeping.service");
const timekeeping_tasks_1 = require("./timekeeping.tasks");
const auth_module_1 = require("../auth/auth.module");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_module_1 = require("../mail/mail.module");
const leave_balances_module_1 = require("../leave-balances/leave-balances.module");
let TimekeepingModule = class TimekeepingModule {
};
exports.TimekeepingModule = TimekeepingModule;
exports.TimekeepingModule = TimekeepingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            supabase_1.SupabaseModule,
            mail_module_1.MailModule,
            leave_balances_module_1.LeaveBalancesModule,
        ],
        controllers: [timekeeping_controller_1.TimekeepingController],
        providers: [timekeeping_service_1.TimekeepingService, timekeeping_tasks_1.TimekeepingTasksService],
        exports: [timekeeping_service_1.TimekeepingService],
    })
], TimekeepingModule);
//# sourceMappingURL=timekeeping.module.js.map