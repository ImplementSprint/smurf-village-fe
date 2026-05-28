"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isHttpException = exception instanceof common_1.HttpException;
        const statusCode = isHttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const fallbackErrorText = common_1.HttpStatus[statusCode] ?? 'Error';
        const fallbackMessage = statusCode === common_1.HttpStatus.INTERNAL_SERVER_ERROR
            ? 'Internal Server Error'
            : fallbackErrorText;
        const exceptionBody = isHttpException ? exception.getResponse() : null;
        let message = fallbackMessage;
        let error = fallbackErrorText;
        if (typeof exceptionBody === 'string') {
            message = exceptionBody;
        }
        else if (exceptionBody && typeof exceptionBody === 'object') {
            const body = exceptionBody;
            if (Array.isArray(body.message)) {
                message = body.message.join('; ');
            }
            else if (typeof body.message === 'string' && body.message.trim().length > 0) {
                message = body.message;
            }
            if (typeof body.error === 'string' && body.error.trim().length > 0) {
                error = body.error;
            }
        }
        response.status(statusCode).json({
            statusCode,
            message,
            error,
            correlationId: request.correlationId ?? 'unknown',
            timestamp: new Date().toISOString(),
            path: request.originalUrl ?? request.url,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map