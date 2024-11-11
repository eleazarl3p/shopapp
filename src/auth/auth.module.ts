import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      //property: 'user',
      //session: false,
    }),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: process.env.EXPIRE },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
