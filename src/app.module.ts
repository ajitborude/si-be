/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './common/condig/configuration';
import { HealthModule } from './health/health.module';
import { InstagramModule } from './instagram/instagram.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
			expandVariables: true,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URL'),
				dbName: 'social-insights',
				connectionFactory: (connection: mongoose.Connection) => {
					connection.plugin(require('mongoose-autopopulate'));
					return connection;
				},
			}),
			inject: [ConfigService],
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			global: true,
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '24h' },
			}),
			inject: [ConfigService],
		}),
		HttpModule.register({
			global: true,
		}),
		AuthModule,
		HealthModule,
		UserModule,
		InstagramModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
