import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
export declare class MailController {
    private readonly mailService;
    private readonly config;
    constructor(mailService: MailService, config: ConfigService);
    testEmail(to: string): Promise<{
        message: string;
    }>;
}
