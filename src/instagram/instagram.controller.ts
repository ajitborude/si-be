import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth/auth.guard';

import { User } from 'src/common/db/schemas/user.schema';
import { UserEntity } from 'src/user/user.decorator';
import { ReplyCommentBodyDto } from './dto/instagram.dto';
import { InstagramService } from './instagram.service';

@Controller('instagram')
export class InstagramController {
	constructor(
		private readonly instagramService: InstagramService,
		private readonly configService: ConfigService,
	) {}

	@UseGuards(AuthGuard)
	@Get('media')
	async getMedia(@UserEntity() user: User) {
		try {
			const mediaList = await this.instagramService.getUserMediaList(user.access_token);
			return { message: 'Success', data: { media: mediaList.data, paging: mediaList.paging } };
		} catch (error: any) {
			console.error(error.response);
			throw new BadRequestException({ error: error.response.data.error_message, message: error.response.statusText });
		}
	}

	@UseGuards(AuthGuard)
	@Get('media/:mediaId')
	async getMediaData(@UserEntity() user: User, @Param('mediaId') mediaId: string) {
		try {
			const comments = await this.instagramService.getUserMedia(user.access_token, mediaId);
			return { message: 'Success', data: comments };
		} catch (error: any) {
			console.error(error.response);
			throw new BadRequestException({ error: error.response.data.error_message, message: error.response.statusText });
		}
	}

	@UseGuards(AuthGuard)
	@Get('media/:mediaId/comments')
	async getMediaComments(@UserEntity() user: User, @Param('mediaId') mediaId: string) {
		try {
			const comments = await this.instagramService.getMediaComments(mediaId, user.access_token);
			return { message: 'Success', data: comments };
		} catch (error: any) {
			console.error(error.response);
			throw new BadRequestException({ error: error.response.data.error_message, message: error.response.statusText });
		}
	}

	@UseGuards(AuthGuard)
	@Post('comment/:commentId/reply')
	async replyToComment(@UserEntity() user: User, @Param('commentId') commentId: string, @Body() body: ReplyCommentBodyDto) {
		try {
			const response = await this.instagramService.replyToComment(user.access_token, commentId, body.message);
			return { message: 'Success', data: response };
		} catch (error: any) {
			console.error(error.response);
			throw new BadRequestException({ error: error.response.data.error_message, message: error.response.statusText });
		}
	}
}
