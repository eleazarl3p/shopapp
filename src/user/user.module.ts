import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialUser } from '../specialuser/entity/special-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SpecialUser])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
