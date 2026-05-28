"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const auth_module_1 = require("../auth/auth.module");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_module_1 = require("../mail/mail.module");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const timekeeping_module_1 = require("../timekeeping/timekeeping.module");
const leave_balances_module_1 = require("../leave-balances/leave-balances.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        imports: [auth_module_1.AuthModule, supabase_1.SupabaseModule, mail_module_1.MailModule, audit_module_1.AuditModule, notifications_module_1.NotificationsModule, timekeeping_module_1.TimekeepingModule, leave_balances_module_1.LeaveBalancesModule],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map