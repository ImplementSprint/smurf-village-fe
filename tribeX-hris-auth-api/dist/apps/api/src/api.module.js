"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const api_center_1 = require("../../../libs/api-center/src");
const api_controller_1 = require("./api.controller");
const api_service_1 = require("./api.service");
const common_2 = require("../../../libs/common/src");
const common_3 = require("../../../libs/common/src");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const supabase_1 = require("../../../libs/supabase/src");
const users_module_1 = require("./users/users.module");
const mail_module_1 = require("./mail/mail.module");
const timekeeping_module_1 = require("./timekeeping/timekeeping.module");
const applicants_module_1 = require("./applicants/applicants.module");
const jobs_module_1 = require("./jobs/jobs.module");
const audit_module_1 = require("./audit/audit.module");
const onboarding_module_1 = require("./onboarding/onboarding.module");
const notifications_module_1 = require("./notifications/notifications.module");
const subscription_module_1 = require("./subscription/subscription.module");
const leave_module_1 = require("./leave/leave.module");
const overtime_module_1 = require("./overtime/overtime.module");
const leave_balances_module_1 = require("./leave-balances/leave-balances.module");
const payroll_module_1 = require("./payroll/payroll.module");
const cnb_module_1 = require("./cnb/cnb.module");
const offboarding_module_1 = require("./offboarding/offboarding.module");
const performance_module_1 = require("./performance/performance.module");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const shouldValidateEnv = process.env.NODE_ENV === 'production';
let ApiModule = class ApiModule {
    configure(consumer) {
        consumer.apply(common_3.CorrelationIdMiddleware).forRoutes('*');
    }
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                cache: true,
                ...(shouldValidateEnv ? { validate: common_2.validateEnv } : {}),
            }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),
            supabase_1.SupabaseModule,
            api_center_1.ApiCenterSdkModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            mail_module_1.MailModule,
            timekeeping_module_1.TimekeepingModule,
            applicants_module_1.ApplicantsModule,
            jobs_module_1.JobsModule,
            audit_module_1.AuditModule,
            onboarding_module_1.OnboardingModule,
            notifications_module_1.NotificationsModule,
            subscription_module_1.SubscriptionModule,
            leave_module_1.LeaveModule,
            overtime_module_1.OvertimeModule,
            leave_balances_module_1.LeaveBalancesModule,
            payroll_module_1.PayrollModule,
            cnb_module_1.CnbModule,
            offboarding_module_1.OffboardingModule,
            performance_module_1.PerformanceModule,
            super_admin_module_1.SuperAdminModule,
        ],
        controllers: [api_controller_1.ApiController],
        providers: [api_service_1.ApiService],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map