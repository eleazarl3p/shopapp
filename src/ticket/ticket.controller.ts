import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { LoadTicketDto } from './dto/load-ticket.dto';
import { DeliveredTicketDto } from './dto/deliver-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('ticket')
@UseGuards(AuthGuard('jwt'))
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post(':jobname')
  create(
    @Param('jobname') jobname: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketService.create(createTicketDto, jobname);
  }

  @Get()
  findAll() {
    return this.ticketService.findAll();
  }

  @Get('job/:jobname')
  findAllByJob(@Param('jobname') jobname: string) {
    return this.ticketService.findAllByJob(jobname);
  }

  @Get(':barcode')
  findOne(@Param('barcode') barcode: string) {
    return this.ticketService.findOne(barcode);
  }

  @Get('available-members/:jobid/')
  availableMembers(@Param('jobid', ParseIntPipe) jobid: number) {
    return this.ticketService.availableMembers(jobid);
  }

  @Post('loading/:ticketid/:truckid')
  load(
    @Param('ticketid') ticketId: number,
    @Param('truckid') truckId: number,
    @Query('partial', ParseBoolPipe) partial: boolean,
    @Body() loadTicketDto: LoadTicketDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.ticketService.loadTicket(
      ticketId,
      truckId,
      loadTicketDto,
      partial,
      userId,
    );
  }

  @Post('delivery/:ticketid')
  delivered(
    @Param('ticketid') ticketId: number,
    @Body() deliveredTicketDto: LoadTicketDto,
    @Query('partial', ParseBoolPipe) partial: boolean,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.ticketService.deliveredTicket(
      ticketId,
      deliveredTicketDto,
      partial,
      userId,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
