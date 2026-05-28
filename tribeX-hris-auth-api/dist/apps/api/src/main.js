"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = require("express");
const api_module_1 = require("./api.module");
const common_2 = require("../../../libs/common/src");
const common_3 = require("../../../libs/common/src");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(api_module_1.ApiModule, { bodyParser: false });
    const configService = app.get(config_1.ConfigService);
    const enableSwagger = configService.get('ENABLE_SWAGGER') === 'true';
    app.use((0, helmet_1.default)());
    app.use((0, express_1.json)({ limit: '5mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '5mb' }));
    app.use((0, cookie_parser_1.default)());
    app.enableShutdownHooks();
    app.setGlobalPrefix('api/tribeX/auth/v1');
    app.enableCors((0, common_3.corsOptions)(configService.get('ALLOWED_ORIGINS')));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new common_2.AllExceptionsFilter());
    if (enableSwagger) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Blue Tribe Authentication APIs')
            .setDescription('Authentication endpoints for shared platform usage.')
            .setVersion('1.0.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/tribeX/auth/v1/docs', app, document);
        logger.log('Swagger docs available at /api/tribeX/auth/v1/docs');
    }
    const port = configService.get('PORT') || 5000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application running on 0.0.0.0:${String(port)}`);
}
bootstrap();
//# sourceMappingURL=main.js.map