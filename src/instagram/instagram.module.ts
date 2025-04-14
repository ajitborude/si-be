import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/common/db/schemas/user.schema';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [InstagramController],
	providers: [InstagramService],
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), UserModule],
	exports: [InstagramService],
})
export class InstagramModule {}
