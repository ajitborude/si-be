import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/common/db/schemas/user.schema';

@Injectable()
export class UserService {
	constructor(
		private readonly httpService: HttpService,
		private configService: ConfigService,
		@InjectModel('User') private userModel: Model<User>,
	) {}

	async findByUserName(username: string): Promise<User> {
		const user = await this.userModel.findOne({ username }).exec();
		if (!user) {
			throw new NotFoundException(`User with username ${username} not found`);
		}
		return user.toJSON();
	}

	// Soft delete a user (marks the document as deleted)
	// async softDelete(id: string): Promise<User> {
	// 	const user = await this.userModel.findById(id).exec();
	// 	if (!user) {
	// 		throw new NotFoundException(`User with id ${id} not found`);
	// 	}
	// 	return user.softDelete();
	// }
}
