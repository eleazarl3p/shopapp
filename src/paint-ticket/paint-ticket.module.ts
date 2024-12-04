import { Module } from '@nestjs/common';
import { PaintTicketController } from './paint-ticket.controller';
import { PaintTicketService } from './paint-ticket.service';
import { PaintTicket } from './entities/paint-ticket.entity';
import { PaintTicketHistory } from './entities/paint-ticket-history.entity';

@Module({
  imports: [PaintTicket, PaintTicketHistory],
  controllers: [PaintTicketController],
  providers: [PaintTicketService],
})
export class PaintTicketModule {}
