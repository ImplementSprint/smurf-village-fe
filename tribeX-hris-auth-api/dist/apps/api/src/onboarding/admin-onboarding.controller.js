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
exports.AdminOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const onboarding_service_1 = require("./onboarding.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const assign_template_dto_1 = require("./dto/assign-template.dto");
const create_video_dto_1 = require("./dto/create-video.dto");
const update_video_dto_1 = require("./dto/update-video.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AdminOnboardingController = class AdminOnboardingController {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    createTemplate(dto) {
        return this.onboardingService.createTemplate(dto);
    }
    getAllTemplates() {
        return this.onboardingService.getAllTemplates();
    }
    assignTemplate(dto) {
        return this.onboardingService.assignTemplate(dto);
    }
    getPositions() {
        return this.onboardingService.getAllPositions();
    }
    createPosition(body) {
        return this.onboardingService.createPosition(body);
    }
    getDepartments() {
        return this.onboardingService.getDepartments();
    }
    uploadTemplateImage(file) {
        return this.onboardingService.uploadTemplateImage(file);
    }
    addTemplateItem(templateId, body) {
        return this.onboardingService.addTemplateItem(templateId, body);
    }
    updateTemplateItem(itemId, body) {
        return this.onboardingService.updateTemplateItem(itemId, body);
    }
    deleteTemplateItem(itemId) {
        return this.onboardingService.deleteTemplateItem(itemId);
    }
    uploadTrainingVideo(file) {
        return this.onboardingService.uploadTrainingVideo(file);
    }
    createTrainingVideo(dto, req) {
        return this.onboardingService.createTrainingVideo(req.user.company_id, dto, req.user.sub_userid);
    }
    getTrainingVideos(req, templateId) {
        return this.onboardingService.getTrainingVideos(req.user.company_id, templateId);
    }
    updateTrainingVideo(videoId, dto, req) {
        return this.onboardingService.updateTrainingVideo(videoId, req.user.company_id, dto);
    }
    deleteTrainingVideo(videoId, req) {
        return this.onboardingService.deleteTrainingVideo(videoId, req.user.company_id);
    }
};
exports.AdminOnboardingController = AdminOnboardingController;
__decorate([
    (0, common_1.Post)('templates'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new onboarding template with items' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List all onboarding templates with their items' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "getAllTemplates", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, roles_decorator_1.Roles)('System Admin', 'HR Officer'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a template to an employee, creating their onboarding session' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_template_dto_1.AssignTemplateDto]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "assignTemplate", null);
__decorate([
    (0, common_1.Get)('positions'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List all job positions with department names' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Post)('positions'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new job position' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "createPosition", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, roles_decorator_1.Roles)('System Admin', 'HR Officer'),
    (0, swagger_1.ApiOperation)({ summary: 'List all departments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "getDepartments", null);
__decorate([
    (0, common_1.Post)('template-assets/images'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an image asset for onboarding template rich content' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "uploadTemplateImage", null);
__decorate([
    (0, common_1.Post)('templates/:templateId/items'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new item to an existing template' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "addTemplateItem", null);
__decorate([
    (0, common_1.Patch)('template-items/:itemId'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a template item (title, description, is_required, rich_content)' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "updateTemplateItem", null);
__decorate([
    (0, common_1.Delete)('template-items/:itemId'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a template item' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "deleteTemplateItem", null);
__decorate([
    (0, common_1.Post)('training-videos/upload'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)(), limits: { fileSize: 100 * 1024 * 1024 } })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a training video file to Supabase storage and return its public URL' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "uploadTrainingVideo", null);
__decorate([
    (0, common_1.Post)('training-videos'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new onboarding training video' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_video_dto_1.CreateVideoDto, Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "createTrainingVideo", null);
__decorate([
    (0, common_1.Get)('training-videos'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'List training videos for the company, optionally filtered by templateId' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "getTrainingVideos", null);
__decorate([
    (0, common_1.Patch)('training-videos/:videoId'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a training video (title, description, url, order, active status)' }),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_video_dto_1.UpdateVideoDto, Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "updateTrainingVideo", null);
__decorate([
    (0, common_1.Delete)('training-videos/:videoId'),
    (0, roles_decorator_1.Roles)('System Admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a training video' }),
    __param(0, (0, common_1.Param)('videoId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminOnboardingController.prototype, "deleteTrainingVideo", null);
exports.AdminOnboardingController = AdminOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('System Admin Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('onboarding/system-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], AdminOnboardingController);
//# sourceMappingURL=admin-onboarding.controller.js.map