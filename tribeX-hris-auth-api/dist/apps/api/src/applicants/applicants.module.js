"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantsModule = void 0;
const common_1 = require("@nestjs/common");
const applicants_controller_1 = require("./applicants.controller");
const applicants_service_1 = require("./applicants.service");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_module_1 = require("../mail/mail.module");
const auth_module_1 = require("../auth/auth.module");
let ApplicantsModule = class ApplicantsModule {
};
exports.ApplicantsModule = ApplicantsModule;
exports.ApplicantsModule = ApplicantsModule = __decorate([
    (0, common_1.Module)({
        controllers: [applicants_controller_1.ApplicantsController],
        providers: [applicants_service_1.ApplicantsService],
        imports: [supabase_1.SupabaseModule, mail_module_1.MailModule, auth_module_1.AuthModule],
    })
], ApplicantsModule);
//# sourceMappingURL=applicants.module.js.map