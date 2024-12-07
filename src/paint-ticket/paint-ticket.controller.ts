import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PaintTicketDto } from 'src/task/dto/task-on-hold';
import { PaintTicketService } from './paint-ticket.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('paint-ticket')
@UseGuards(AuthGuard('jwt'))
export class PaintTicketController {
  constructor(private readonly paintTicketService: PaintTicketService) {}

  @Post('create')
  async create(
    @Body()
    ticketDto: PaintTicketDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return await this.paintTicketService.create(ticketDto, userId);
  }

  @Get(':id')
  findOne(@Param('id') ticketId: number) {
    return this.paintTicketService.findOne(ticketId);
  }
}
