"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationIdMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const MAX_CORRELATION_ID_LENGTH = 128;
const CORRELATION_ID_HEADER = 'x-correlation-id';
function sanitizeCorrelationId(input) {
    if (!input)
        return null;
    const raw = Array.isArray(input) ? input[0] : input;
    const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, MAX_CORRELATION_ID_LENGTH);
    return cleaned.length > 0 ? cleaned : null;
}
let CorrelationIdMiddleware = class CorrelationIdMiddleware {
    use(req, res, next) {
        const incoming = sanitizeCorrelationId(req.headers[CORRELATION_ID_HEADER]);
        const correlationId = incoming ?? (0, crypto_1.randomUUID)();
        req.correlationId = correlationId;
        res.setHeader('X-Correlation-ID', correlationId);
        next();
    }
};
exports.CorrelationIdMiddleware = CorrelationIdMiddleware;
exports.CorrelationIdMiddleware = CorrelationIdMiddleware = __decorate([
    (0, common_1.Injectable)()
], CorrelationIdMiddleware);
//# sourceMappingURL=correlation-id.middleware.js.map