import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
	constructor(
		private readonly healthService: HealthService,
		private health: HealthCheckService,
		private http: HttpHealthIndicator,
		private mongoose: MongooseHealthIndicator,
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([() => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'), async () => this.mongoose.pingCheck('mongoose')]);
	}
}
