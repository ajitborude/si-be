import { Controller, Get, UseGuards } from '@nestjs/common';
import { omit } from 'lodash';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/common/db/schemas/user.schema';
import { UserEntity } from './user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(AuthGuard)
	@Get('')
	getUser(@UserEntity() user: User) {
		return {
			message: 'Success',
			data: omit(user, ['access_token', 'user_id']),
		};
	}

	@Get('dummy')
	dummyAPI() {
		return {
			message: 'Success',
			data: ['access_token', 'user_id'],
		};
	}
}
