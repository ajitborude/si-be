import { forwardRef, Module } from '@nestjs/common';
import { InstagramModule } from 'src/instagram/instagram.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [forwardRef(() => UserModule), forwardRef(() => InstagramModule)],
	exports: [AuthService],
})
export class AuthModule {}
