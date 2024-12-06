import { Module } from '@nestjs/common';
import { PaintTicketController } from './paint-ticket.controller';
import { PaintTicketService } from './paint-ticket.service';
import { PaintTicket } from './entities/paint-ticket.entity';
import { PaintTicketHistory } from './entities/paint-ticket-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaintTicket, PaintTicketHistory]),
    TaskModule,
  ],
  controllers: [PaintTicketController],
  providers: [PaintTicketService],
})
export class PaintTicketModule {}
