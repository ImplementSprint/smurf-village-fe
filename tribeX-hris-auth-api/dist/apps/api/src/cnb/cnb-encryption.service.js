"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CnbEncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CnbEncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("node:crypto"));
let CnbEncryptionService = CnbEncryptionService_1 = class CnbEncryptionService {
    logger = new common_1.Logger(CnbEncryptionService_1.name);
    ALGORITHM = 'aes-256-gcm';
    key;
    constructor() {
        const keyHex = process.env.CNB_ENCRYPTION_KEY;
        if (keyHex && keyHex.length === 64) {
            this.key = Buffer.from(keyHex, 'hex');
        }
        else {
            this.logger.warn('CNB_ENCRYPTION_KEY not set or invalid (must be 64 hex chars = 32 bytes). ' +
                'Sensitive C&B fields will be stored as plaintext.');
            this.key = null;
        }
    }
    encrypt(plaintext) {
        if (!this.key)
            return plaintext;
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }
    decrypt(ciphertext) {
        if (!this.key)
            return ciphertext;
        const parts = ciphertext.split(':');
        if (parts.length !== 3) {
            return ciphertext;
        }
        try {
            const [ivHex, tagHex, encHex] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const enc = Buffer.from(encHex, 'hex');
            const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
            decipher.setAuthTag(tag);
            return decipher.update(enc).toString('utf8') + decipher.final('utf8');
        }
        catch {
            return ciphertext;
        }
    }
    encryptNumber(value) {
        return this.encrypt(String(value));
    }
    decryptToNumber(ciphertext) {
        return parseFloat(this.decrypt(ciphertext)) || 0;
    }
};
exports.CnbEncryptionService = CnbEncryptionService;
exports.CnbEncryptionService = CnbEncryptionService = CnbEncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CnbEncryptionService);
//# sourceMappingURL=cnb-encryption.service.js.map