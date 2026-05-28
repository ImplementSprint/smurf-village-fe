"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingModule = void 0;
const common_1 = require("@nestjs/common");
const offboarding_service_1 = require("./offboarding.service");
const employee_offboarding_controller_1 = require("./employee-offboarding.controller");
const manager_offboarding_controller_1 = require("./manager-offboarding.controller");
const hr_offboarding_controller_1 = require("./hr-offboarding.controller");
const system_admin_offboarding_controller_1 = require("./system-admin-offboarding.controller");
const auth_module_1 = require("../auth/auth.module");
const supabase_1 = require("../../../../libs/supabase/src");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const cnb_module_1 = require("../cnb/cnb.module");
const cnb_encryption_service_1 = require("../cnb/cnb-encryption.service");
let OffboardingModule = class OffboardingModule {
};
exports.OffboardingModule = OffboardingModule;
exports.OffboardingModule = OffboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, supabase_1.SupabaseModule, audit_module_1.AuditModule, notifications_module_1.NotificationsModule, cnb_module_1.CnbModule],
        controllers: [
            employee_offboarding_controller_1.EmployeeOffboardingController,
            manager_offboarding_controller_1.ManagerOffboardingController,
            hr_offboarding_controller_1.HrOffboardingController,
            system_admin_offboarding_controller_1.SystemAdminOffboardingController,
        ],
        providers: [offboarding_service_1.OffboardingService, cnb_encryption_service_1.CnbEncryptionService],
        exports: [offboarding_service_1.OffboardingService],
    })
], OffboardingModule);
//# sourceMappingURL=offboarding.module.js.map