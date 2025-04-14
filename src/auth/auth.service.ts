import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	async generateToken(username: string): Promise<{ access_token: string }> {
		const user = await this.userService.findByUserName(username);
		const payload = { sub: user.user_id, username: user.username };
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
