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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminDashboardController = void 0;
const common_1 = require("@nestjs/common");
const super_admin_guard_1 = require("../super-admin.guard");
const dashboard_service_1 = require("./dashboard.service");
let SuperAdminDashboardController = class SuperAdminDashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    stats() { return this.service.getStats(); }
    pendingApprovals() { return this.service.getPendingApprovals(); }
};
exports.SuperAdminDashboardController = SuperAdminDashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminDashboardController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminDashboardController.prototype, "pendingApprovals", null);
exports.SuperAdminDashboardController = SuperAdminDashboardController = __decorate([
    (0, common_1.Controller)('super-admin/dashboard'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __metadata("design:paramtypes", [dashboard_service_1.SuperAdminDashboardService])
], SuperAdminDashboardController);
//# sourceMappingURL=dashboard.controller.js.map