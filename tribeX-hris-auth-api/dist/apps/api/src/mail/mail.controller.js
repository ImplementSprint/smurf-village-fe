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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("./mail.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MailController = class MailController {
    mailService;
    config;
    constructor(mailService, config) {
        this.mailService = mailService;
        this.config = config;
    }
    async testEmail(to) {
        if (this.config.get('NODE_ENV') === 'production') {
            throw new common_1.ForbiddenException('Not available in production');
        }
        if (!to)
            throw new common_1.BadRequestException('Missing ?to= query param');
        await this.mailService.sendInvite(to, 'http://localhost:3000/set-password?token=test-token');
        return { message: `Test email sent to ${to}` };
    }
};
exports.MailController = MailController;
__decorate([
    (0, common_1.Get)('test'),
    __param(0, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "testEmail", null);
exports.MailController = MailController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('mail'),
    __metadata("design:paramtypes", [mail_service_1.MailService,
        config_1.ConfigService])
], MailController);
//# sourceMappingURL=mail.controller.js.map