"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_module_1 = require("../mail/mail.module");
const super_admin_guard_1 = require("./super-admin.guard");
const super_admin_auth_controller_1 = require("./auth/super-admin-auth.controller");
const super_admin_auth_service_1 = require("./auth/super-admin-auth.service");
const companies_controller_1 = require("./companies/companies.controller");
const companies_service_1 = require("./companies/companies.service");
const dashboard_controller_1 = require("./dashboard/dashboard.controller");
const dashboard_service_1 = require("./dashboard/dashboard.service");
const renewals_controller_1 = require("./renewals/renewals.controller");
const renewals_service_1 = require("./renewals/renewals.service");
const subscriptions_controller_1 = require("./subscriptions/subscriptions.controller");
const subscriptions_service_1 = require("./subscriptions/subscriptions.service");
const settings_controller_1 = require("./settings/settings.controller");
const settings_service_1 = require("./settings/settings.service");
let SuperAdminModule = class SuperAdminModule {
};
exports.SuperAdminModule = SuperAdminModule;
exports.SuperAdminModule = SuperAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_1.SupabaseModule, mail_module_1.MailModule, jwt_1.JwtModule],
        controllers: [
            super_admin_auth_controller_1.SuperAdminAuthController,
            companies_controller_1.SuperAdminCompaniesController,
            dashboard_controller_1.SuperAdminDashboardController,
            renewals_controller_1.SuperAdminRenewalsController,
            subscriptions_controller_1.SuperAdminSubscriptionsController,
            settings_controller_1.SuperAdminSettingsController,
        ],
        providers: [
            super_admin_guard_1.SuperAdminGuard,
            super_admin_auth_service_1.SuperAdminAuthService,
            companies_service_1.SuperAdminCompaniesService,
            dashboard_service_1.SuperAdminDashboardService,
            renewals_service_1.SuperAdminRenewalsService,
            subscriptions_service_1.SuperAdminSubscriptionsService,
            settings_service_1.SuperAdminSettingsService,
        ],
    })
], SuperAdminModule);
//# sourceMappingURL=super-admin.module.js.map