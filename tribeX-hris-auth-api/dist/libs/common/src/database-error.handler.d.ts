import { Logger, BadRequestException } from '@nestjs/common';
export declare class DatabaseErrorHandler {
    static handle(error: any, context: string, logger?: Logger): BadRequestException;
}
