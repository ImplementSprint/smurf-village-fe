"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseErrorHandler = void 0;
const common_1 = require("@nestjs/common");
class DatabaseErrorHandler {
    static handle(error, context, logger) {
        if (logger) {
            logger.error(`Database error in ${context}: ${error.message}`, error.stack);
        }
        if (error.code === 'PGRST116') {
            throw new common_1.BadRequestException(`Record not found in ${context}`);
        }
        if (error.code === 'PGRST301') {
            throw new common_1.BadRequestException(`Invalid query in ${context}: ${error.message}`);
        }
        if (error.code === 'PGRST100') {
            throw new common_1.BadRequestException(`Authentication failed in ${context}`);
        }
        if (error.code === '23505') {
            throw new common_1.BadRequestException(`Duplicate record in ${context}: ${error.message}`);
        }
        if (error.code === '23503') {
            throw new common_1.BadRequestException(`Referenced record not found in ${context}`);
        }
        throw new common_1.BadRequestException(`Failed to perform operation in ${context}: ${error.message || 'Unknown error'}`);
    }
}
exports.DatabaseErrorHandler = DatabaseErrorHandler;
//# sourceMappingURL=database-error.handler.js.map