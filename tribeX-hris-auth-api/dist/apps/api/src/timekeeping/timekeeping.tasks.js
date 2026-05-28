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
var TimekeepingTasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimekeepingTasksService = void 0;
const common_1 = require("@nestjs/common");
const timekeeping_service_1 = require("./timekeeping.service");
let TimekeepingTasksService = TimekeepingTasksService_1 = class TimekeepingTasksService {
    timekeepingService;
    logger = new common_1.Logger(TimekeepingTasksService_1.name);
    constructor(timekeepingService) {
        this.timekeepingService = timekeepingService;
    }
    async handleAutoMarkAbsent() {
        this.logger.log('CRON: auto-mark-absent job triggered');
        try {
            const result = await this.timekeepingService.autoMarkAbsentEmployees();
            this.logger.log(`CRON: auto-mark-absent complete — marked: ${result.marked}, skipped: ${result.skipped}, date: ${result.date}`);
        }
        catch (err) {
            this.logger.error('CRON: auto-mark-absent failed', err);
        }
    }
};
exports.TimekeepingTasksService = TimekeepingTasksService;
exports.TimekeepingTasksService = TimekeepingTasksService = TimekeepingTasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [timekeeping_service_1.TimekeepingService])
], TimekeepingTasksService);
//# sourceMappingURL=timekeeping.tasks.js.map