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
exports.SaveStatutoryIdsDto = void 0;
const class_validator_1 = require("class-validator");
class SaveStatutoryIdsDto {
    tin_number;
    sss_number;
    philhealth_number;
    pagibig_number;
}
exports.SaveStatutoryIdsDto = SaveStatutoryIdsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'tin_number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{3}-\d{3}-\d{3}-\d{3}$/, {
        message: 'tin_number must be in the format 123-456-789-000',
    }),
    __metadata("design:type", String)
], SaveStatutoryIdsDto.prototype, "tin_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'sss_number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{2}-\d{7}-\d{1}$/, {
        message: 'sss_number must be in the format 12-3456789-0',
    }),
    __metadata("design:type", String)
], SaveStatutoryIdsDto.prototype, "sss_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'philhealth_number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{2}-\d{9}-\d{1}$/, {
        message: 'philhealth_number must be in the format 12-345678901-2',
    }),
    __metadata("design:type", String)
], SaveStatutoryIdsDto.prototype, "philhealth_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'pagibig_number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{4}-\d{4}-\d{4}$/, {
        message: 'pagibig_number must be in the format 1234-5678-9012',
    }),
    __metadata("design:type", String)
], SaveStatutoryIdsDto.prototype, "pagibig_number", void 0);
//# sourceMappingURL=save-statutory-ids.dto.js.map