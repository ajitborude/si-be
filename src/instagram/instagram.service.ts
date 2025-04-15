import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { User } from 'src/common/db/schemas/user.schema';
import { createQuery } from 'src/common/utils/common';
import { CreateUserDto, LLTokenResDto, SLTokenResDto, UserResDto } from './dto/instagram.dto';

@Injectable()
export class InstagramService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		@InjectModel('User') private userModel: Model<User>,
	) {}

	async getShortLivedToken(code: string) {
		const igClientId = this.configService.get<string>('IG_CLIENT_ID') || '';
		const igClientSecret = this.configService.get<string>('IG_CLIENT_SECRET') || '';
		const redirectUri = this.configService.get<string>('IG_REDIRECT_URI') || '';
		const authApi = this.configService.get<string>('INSTAGRAM_AUTH_API') || '';
		// Exchange code for short lived access_token
		const fData = new FormData();
		fData.append('client_id', igClientId);
		fData.append('client_secret', igClientSecret);
		fData.append('grant_type', 'authorization_code');
		fData.append('redirect_uri', redirectUri);
		fData.append('code', code);
		const { data } = await firstValueFrom(
			this.httpService.post<SLTokenResDto>(`${authApi}/access_token`, fData).pipe(
				catchError((error: AxiosError) => {
					throw error;
				}),
			),
		);
		return data;
	}

	async getLongLivedToken(token: string) {
		const igClientSecret = this.configService.get<string>('IG_CLIENT_SECRET') || '';
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';
		const { data } = await firstValueFrom(
			this.httpService
				.get<LLTokenResDto>(
					`${graphApi}/access_token?${createQuery({
						grant_type: 'ig_exchange_token',
						client_secret: igClientSecret,
						access_token: token,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		return data;
	}

	async getUserDetails(token: string) {
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';

		const { data } = await firstValueFrom(
			this.httpService
				.get<UserResDto>(
					`${graphApi}/me?${createQuery({
						fields: 'user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography',
						access_token: token,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		return data;
	}

	async getUserMediaList(accessToken: string) {
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';

		const { data } = await firstValueFrom(
			this.httpService
				.get<any>(
					`${graphApi}/me/media?${createQuery({
						fields: 'caption,comments_count,id,media_product_type,media_type,media_url,permalink,shortcode,thumbnail_url,timestamp,children{media_url}',
						limit: 50,
						access_token: accessToken,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		return data;
	}

	async getUserMedia(accessToken: string, mediaId: string) {
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';

		const { data } = await firstValueFrom(
			this.httpService
				.get<any>(
					`${graphApi}/${mediaId}?${createQuery({
						fields:
							'caption,comments_count,id,media_product_type,media_type,media_url,permalink,shortcode,thumbnail_url,timestamp,children{media_url},comments{from,id,like_count,parent_id,replies{id,text,timestamp},text,timestamp,user,username}',
						limit: 50,
						access_token: accessToken,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		// 	// Fetch profile_urls for commenter
		// if (data.comments.data) {
		// }
		return data;
	}

	async getMediaComments(mediaId: string, accessToken: string) {
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';

		const { data } = await firstValueFrom(
			this.httpService
				.get<any>(
					`${graphApi}/${mediaId}/comments?${createQuery({
						fields: 'from,id,like_count,parent_id,replies,text,timestamp,user,username',
						access_token: accessToken,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		return data;
	}

	async replyToComment(accessToken: string, commentId: string, message: string) {
		const graphApi = this.configService.get<string>('INSTAGRAM_GRAPH_API') || '';

		const { data } = await firstValueFrom(
			this.httpService
				.post<any>(
					`${graphApi}/${commentId}/replies?${createQuery({
						message: message,
						access_token: accessToken,
					})}`,
				)
				.pipe(
					catchError((error: AxiosError) => {
						throw error;
					}),
				),
		);
		return data;
	}

	async upsertUser(userDto: Partial<CreateUserDto>): Promise<User> {
		if (!userDto.user_id) {
			throw new Error('user_id is required for upsert');
		}
		const user = await this.userModel.findOneAndUpdate({ user_id: userDto.user_id }, { $set: userDto }, { upsert: true, new: true }).exec();
		return user;
	}
}
