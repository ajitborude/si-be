import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
// import { doubleCsrf } from 'csrf-csrf';
import * as morgan from 'morgan';
import { customLogger } from './common/utils/logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	// const allowedOrigins = configService.get('ALLOWED_ORIGIN') || /\.loca\.lt$/;
	app.enableCors({
		credentials: true,
		origin: [/\.onrender\.com$/, /\.loca\.lt$/, 'http://localhost:5173'],
		// origin: /\.loca\.lt$/,
	});
	app.useGlobalPipes(new ValidationPipe());
	app.setGlobalPrefix('api/v1', {
		exclude: [{ path: 'health', method: RequestMethod.GET }],
	});
	app.use(helmet());
	app.use(cookieParser(configService.get('COOKIE_SECRET')));

	// const { doubleCsrfProtection } = doubleCsrf({
	// 	getSecret: () => configService.get('CSRF_SECRET'),
	// 	cookieName: '__Host-psifi.x-csrf-token',
	// 	cookieOptions: {
	// 		httpOnly: false, // Allow client-side JavaScript to read the token
	// 		secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
	// 		sameSite: 'lax', // Adjust as needed based on your application's requirements
	// 	},
	// });
	// app.use(doubleCsrfProtection);

	// Create a stream object with a 'write' function that Morgan can use
	const stream = {
		write: (message: string) => {
			// Morgan outputs a newline at the end of each message; trim it here.
			customLogger.info(message.trim());
		},
	};

	// Use Morgan middleware with your desired preset format (e.g., 'combined')
	app.use(morgan('combined', { stream }));

	await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
