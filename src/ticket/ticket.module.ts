import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entity/ticket.entity';
import { TicketMember } from './entity/tiketmember.entity';
import { MemberModule } from 'src/member/member.module';

import { OtherItem } from './entity/other-item.entity';
import { JobModule } from 'src/job/job.module';
import { Tcomment } from './entity/tcomment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMember, OtherItem, Tcomment]),
    MemberModule,
    JobModule,
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
