"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const onboarding_service_1 = require("./onboarding.service");
const hr_onboarding_controller_1 = require("./hr-onboarding.controller");
const applicant_onboarding_controller_1 = require("./applicant-onboarding.controller");
const applicant_portal_onboarding_controller_1 = require("./applicant-portal-onboarding.controller");
const admin_onboarding_controller_1 = require("./admin-onboarding.controller");
const new_hire_controller_1 = require("./new-hire.controller");
const auth_module_1 = require("../auth/auth.module");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_module_1 = require("../mail/mail.module");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const timekeeping_module_1 = require("../timekeeping/timekeeping.module");
let OnboardingModule = class OnboardingModule {
};
exports.OnboardingModule = OnboardingModule;
exports.OnboardingModule = OnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, supabase_1.SupabaseModule, mail_module_1.MailModule, audit_module_1.AuditModule, notifications_module_1.NotificationsModule, timekeeping_module_1.TimekeepingModule],
        controllers: [
            applicant_onboarding_controller_1.ApplicantOnboardingController,
            applicant_portal_onboarding_controller_1.ApplicantPortalOnboardingController,
            hr_onboarding_controller_1.HrOnboardingController,
            admin_onboarding_controller_1.AdminOnboardingController,
            new_hire_controller_1.NewHireController,
        ],
        providers: [onboarding_service_1.OnboardingService],
        exports: [onboarding_service_1.OnboardingService],
    })
], OnboardingModule);
//# sourceMappingURL=onboarding.module.js.map