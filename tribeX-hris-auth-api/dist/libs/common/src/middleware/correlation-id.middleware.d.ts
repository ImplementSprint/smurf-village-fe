import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
export declare class CorrelationIdMiddleware implements NestMiddleware {
    use(req: Request & {
        correlationId?: string;
    }, res: Response, next: NextFunction): void;
}
