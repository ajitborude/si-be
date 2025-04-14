import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { InstagramService } from 'src/instagram/instagram.service';
import { AuthQueryDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly instagramService: InstagramService,
		private readonly configService: ConfigService,
	) {}

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
				res.cookie('token', token.access_token, { httpOnly: true, secure: true, signed: true });
				res.status(HttpStatus.OK).json({ redirectTo: `/user/${username}` });
			} catch (error: any) {
				res.status(HttpStatus.BAD_REQUEST).json({ error: error.response.data.error_message, message: error.response.statusText });
			}
		} else {
			// If error
			console.error(query.error_description);
			res.redirect(HttpStatus.FOUND, `${feBaseUrl}/error?errorCode=${query.error ? query.error : 'default'}`);
			// return `Code : ${query.code}`;
		}
	}
}
