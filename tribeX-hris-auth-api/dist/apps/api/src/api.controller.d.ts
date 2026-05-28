import { ApiService } from './api.service';
export declare class ApiController {
    private readonly apiService;
    constructor(apiService: ApiService);
    getServiceInfo(): {
        service: string;
        version: string;
    };
}
