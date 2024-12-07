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
      painting_type: ticketDto.paint_type,
      created_by: { _id: userId } as User,
    });

    const savedTicket = await ticket.save();

    await Promise.all(
      ticketDto.tasks.map(async (ta) => {
        await this.taskService.updateForPaint(ta._id, savedTicket._id);
      }),
    );
    const barcode = `PT-${ticketDto.job}-${savedTicket._id.toString().padStart(5, '0')}`;
    await this.paintTicketRepo.update({ _id: savedTicket._id }, { barcode });
    return this.findOne(savedTicket._id);
  }

  async findOne(_id: number) {
    const ticket = await this.paintTicketRepo.findOne({
      where: { _id },
      relations: {
        task_area: { task: { member: true } },
        truck: true,
        history: true,
        created_by: true,
      },
    });

    return {
      _id: ticket._id,
      painting_type: ticket.painting_type,
      created_by: ticket.created_by.fullname(),
      created_at: ticket.created_at,
      truck: !ticket.truck ? null : ticket.truck.name,
      members: ticket.task_area.map((ta) => {
        return {
          ...ta.task.member,
          quantity: 1,
        };
      }),
      history: ticket.history,
      barcode: ticket.barcode,
    };
  }
}
