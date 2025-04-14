import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { omit } from 'lodash';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	@Prop()
	name: string;

	@Prop({ required: true, unique: true, immutable: true })
	user_id: string;

	@Prop({ required: true, unique: true })
	username: string;

	@Prop()
	account_type: string;

	@Prop()
	profile_picture_url: string;

	@Prop()
	followers_count: string;

	@Prop()
	follows_count: string;

	@Prop()
	media_count: string;

	@Prop({ required: true })
	access_token: string;

	@Prop({ default: null })
	deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Instance method for soft deletion
UserSchema.methods.softDelete = async function (this: UserDocument): Promise<UserDocument> {
	this.deletedAt = new Date();
	return this.save();
};

// Pre-hook to automatically exclude soft-deleted records from all queries
UserSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
	this.where({ deletedAt: null });
	next();
});

UserSchema.methods.toJSON = function (this: UserDocument) {
	const data = this.toObject();
	return omit(data, ['_id', '__v']);
};
