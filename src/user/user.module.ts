import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/common/db/schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService],
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
	exports: [UserService],
})
export class UserModule {}
