import { Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { InstagramService } from 'src/instagram/instagram.service';
import { AuthQueryDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly instagramService: InstagramService,
		private readonly configService: ConfigService,
	) {}

	@Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
	@Get('instagram-verify')
	async verifyCode(@Query() query: AuthQueryDto, @Res({ passthrough: true }) res: Response) {
		const feBaseUrl = this.configService.get<string>('FE_BASE_URL');
		if (query.code) {
			try {
				const slTokenRes = await this.instagramService.getShortLivedToken(query.code);
				const shortAccessToken = slTokenRes.access_token;
				const llTokenRes = await this.instagramService.getLongLivedToken(shortAccessToken);
				const longAccessToken = llTokenRes.access_token;
				const userData = await this.instagramService.getUserDetails(longAccessToken);
				const createResp = await this.instagramService.upsertUser({ ...userData, access_token: longAccessToken });
				const username = createResp.username;
				const token = await this.authService.generateToken(username);
				res.cookie('token', token.access_token, {
					httpOnly: true,
					signed: true,
					maxAge: 10 * 24 * 60 * 60 * 100, //10 Days
					expires: new Date(Date.now() + 86400000), //24 Hours
					secure: process.env.NODE_ENV === 'production',
					sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // As frontend and backend is on different domains
				});
				res.status(HttpStatus.OK).json({ redirectTo: `/user/${username}` });
			} catch (error: any) {
				res.status(HttpStatus.BAD_REQUEST).json({ error: error.response.data.error_message, message: error.response.statusText });
			}
		} else {
			console.error(query.error_description);
			res.redirect(HttpStatus.FOUND, `${feBaseUrl}/error?errorCode=${query.error ? query.error : 'default'}`);
		}
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		// Clear the authentication cookie.
		// It's important to use the same cookie name and options (such as domain, path, secure, etc.)
		// as you used when setting the cookie, so the browser knows which cookie to clear.
		res.clearCookie('token', {
			httpOnly: true,
			signed: true,
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		});

		res.status(200).json({ message: 'Logged out successfully' });
	}
}
