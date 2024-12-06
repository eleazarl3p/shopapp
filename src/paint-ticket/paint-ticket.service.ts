import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaintTicket } from './entities/paint-ticket.entity';
import { Repository } from 'typeorm';
import { PaintTicketDto } from 'src/task/dto/task-on-hold';
import { Truck } from 'src/truck/entities/truck.entity';
import { User } from 'src/user/entities/user.entity';
import { TaskArea } from 'src/task/entities/taskarea.entity';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class PaintTicketService {
  constructor(
    @InjectRepository(PaintTicket)
    private readonly paintTicketRepo: Repository<PaintTicket>,

    private readonly taskService: TaskService,
  ) {}

  async create(ticketDto: PaintTicketDto, userId: number) {
    const ticket = this.paintTicketRepo.create({
      truck: { _id: ticketDto.truck_id } as Truck,
      painting_type: ticketDto.paint_type,
      created_by: { _id: userId } as User,
    });

    const savedTicket = await ticket.save();

    await Promise.all(
      ticketDto.tasks.map(async (ta) => {
        await this.taskService.updateForPaint(ta._id, savedTicket._id);
      }),
    );
  }
}
