"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
const express_1 = __importDefault(require("express"));
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
const response_interceptor_1 = require("../src/common/interceptors/response.interceptor");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
let cachedServer;
async function bootstrapServer() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const adapter = new platform_express_1.ExpressAdapter(expressApp);
        const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter, { rawBody: true });
        app.enableCors();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
        app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
        cachedServer = (0, serverless_express_1.default)({ app: expressApp });
    }
    return cachedServer;
}
exports.default = async (req, res) => {
    const server = await bootstrapServer();
    return server(req, res);
};
//# sourceMappingURL=index.js.map