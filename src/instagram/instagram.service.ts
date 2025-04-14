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
		// Exchange code for short lived access_token
		const fData = new FormData();
		fData.append('client_id', igClientId);
		fData.append('client_secret', igClientSecret);
		fData.append('grant_type', 'authorization_code');
		fData.append('redirect_uri', redirectUri);
		fData.append('code', code);
		const { data } = await firstValueFrom(
			this.httpService.post<SLTokenResDto>('https://api.instagram.com/oauth/access_token', fData).pipe(
				catchError((error: AxiosError) => {
					throw error;
				}),
			),
		);
		return data;
	}

	async getLongLivedToken(token: string) {
		const igClientSecret = this.configService.get<string>('IG_CLIENT_SECRET') || '';
		const { data } = await firstValueFrom(
			this.httpService
				.get<LLTokenResDto>(
					`https://graph.instagram.com/v22.0/access_token?${createQuery({
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
		const { data } = await firstValueFrom(
			this.httpService
				.get<UserResDto>(
					`https://graph.instagram.com/v22.0/me?${createQuery({
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

	async getUserMediaList(userId: string, accessToken: string) {
		const { data } = await firstValueFrom(
			this.httpService
				.get<any>(
					`https://graph.instagram.com/v22.0/me/media?${createQuery({
						fields:
							'caption,comments_count,id,media_product_type,media_type,media_url,permalink,shortcode,thumbnail_url,timestamp,children{media_url},comments{from,id,like_count,parent_id,replies,text,timestamp,user,username}',
						limit: 10,
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

	async getMediaComments(mediaId: string, accessToken: string) {
		const { data } = await firstValueFrom(
			this.httpService
				.get<any>(
					`https://graph.instagram.com/v22.0/${mediaId}/comments?${createQuery({
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
		const { data } = await firstValueFrom(
			this.httpService
				.post<any>(
					`https://graph.instagram.com/v22.0/${commentId}/replies?${createQuery({
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
