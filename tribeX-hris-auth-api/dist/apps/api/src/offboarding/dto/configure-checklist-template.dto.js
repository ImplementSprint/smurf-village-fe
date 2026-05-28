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
exports.ConfigureChecklistTemplateDto = exports.ChecklistTemplateItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ChecklistTemplateItemDto {
    item_name;
    description;
    is_required;
    category;
    is_custom;
}
exports.ChecklistTemplateItemDto = ChecklistTemplateItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChecklistTemplateItemDto.prototype, "item_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChecklistTemplateItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistTemplateItemDto.prototype, "is_required", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['Asset', 'Document', 'Task'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Asset', 'Document', 'Task']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChecklistTemplateItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ChecklistTemplateItemDto.prototype, "is_custom", void 0);
class ConfigureChecklistTemplateDto {
    template_name;
    employee_type;
    description;
    applicable_offboarding_types;
    is_default;
    require_knowledge_transfer;
    system_access_to_revoke;
    items;
}
exports.ConfigureChecklistTemplateDto = ConfigureChecklistTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfigureChecklistTemplateDto.prototype, "template_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigureChecklistTemplateDto.prototype, "employee_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigureChecklistTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String], enum: ['Resignation', 'Termination', 'End of Contract'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsIn)(['Resignation', 'Termination', 'End of Contract'], { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ConfigureChecklistTemplateDto.prototype, "applicable_offboarding_types", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ConfigureChecklistTemplateDto.prototype, "is_default", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ConfigureChecklistTemplateDto.prototype, "require_knowledge_transfer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ConfigureChecklistTemplateDto.prototype, "system_access_to_revoke", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChecklistTemplateItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChecklistTemplateItemDto),
    __metadata("design:type", Array)
], ConfigureChecklistTemplateDto.prototype, "items", void 0);
//# sourceMappingURL=configure-checklist-template.dto.js.map