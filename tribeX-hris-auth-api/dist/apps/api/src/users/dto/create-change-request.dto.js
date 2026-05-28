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
exports.CreateChangeRequestDto = void 0;
const class_validator_1 = require("class-validator");
class CreateChangeRequestDto {
    field_type;
    requested_changes;
    reason;
    supporting_doc_url;
}
exports.CreateChangeRequestDto = CreateChangeRequestDto;
__decorate([
    (0, class_validator_1.IsEnum)(['legal_name', 'bank']),
    __metadata("design:type", String)
], CreateChangeRequestDto.prototype, "field_type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateChangeRequestDto.prototype, "requested_changes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateChangeRequestDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChangeRequestDto.prototype, "supporting_doc_url", void 0);
//# sourceMappingURL=create-change-request.dto.js.map