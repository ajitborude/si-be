import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
// import { MongooseModule } from '@nestjs/mongoose';

@Module({
	controllers: [HealthController],
	providers: [HealthService],
	imports: [TerminusModule],
})
export class HealthModule {}
