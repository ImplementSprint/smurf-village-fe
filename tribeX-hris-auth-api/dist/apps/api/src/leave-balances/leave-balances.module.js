"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalancesModule = void 0;
const common_1 = require("@nestjs/common");
const leave_balances_controller_1 = require("./leave-balances.controller");
const leave_balances_service_1 = require("./leave-balances.service");
const supabase_1 = require("../../../../libs/supabase/src");
const auth_module_1 = require("../auth/auth.module");
let LeaveBalancesModule = class LeaveBalancesModule {
};
exports.LeaveBalancesModule = LeaveBalancesModule;
exports.LeaveBalancesModule = LeaveBalancesModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_1.SupabaseModule, auth_module_1.AuthModule],
        controllers: [leave_balances_controller_1.LeaveBalancesController],
        providers: [leave_balances_service_1.LeaveBalancesService],
        exports: [leave_balances_service_1.LeaveBalancesService],
    })
], LeaveBalancesModule);
//# sourceMappingURL=leave-balances.module.js.map