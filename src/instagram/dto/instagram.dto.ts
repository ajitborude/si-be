import { OmitType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

export class SLTokenResDto {
	access_token: string;
	user_id: string;
	permissions: string;
}

export class SLTokenErrorDto {
	error_type: string;
	code: string;
	error_message: string;
}

export class LLTokenResDto {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export class CreateUserDto {
	user_id: string;
	username: string;
	name: string;
	account_type: string;
	profile_picture_url: string;
	biography: string;
	followers_count: number;
	follows_count: number;
	media_count: number;
	access_token: string;
}

export class UserResDto extends OmitType(CreateUserDto, ['access_token'] as const) {}

export class GetUserQueryDto {
	@IsNotEmpty()
	username: string;
}
export class ReplyCommentBodyDto {
	@IsNotEmpty()
	message: string;
}
