import { forwardRef, Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';

import { MemberMaterial } from './entities/membermaterial.entity';
import { MemberMaterialService } from './membermaterial.service';

import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberMaterial]),
    forwardRef(() => TaskModule),
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberMaterialService],
  exports: [MemberService, MemberMaterialService],
})
export class MemberModule {}
