import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Ticket } from './entity/ticket.entity';
import { MemberService } from 'src/member/member.service';

import { TicketMember } from './entity/tiketmember.entity';
import { Member } from 'src/member/entities/member.entity';
import { OtherItem } from './entity/other-item.entity';
import { MemberMaterialService } from 'src/member/membermaterial.service';
import { JobService } from 'src/job/job.service';

import { LoadTicketDto } from './dto/load-ticket.dto';

import { Truck } from 'src/truck/entities/truck.entity';
import { Tcomment } from './entity/tcomment.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,

    @InjectRepository(TicketMember)
    private readonly tkmRepo: Repository<TicketMember>,

    @InjectRepository(OtherItem)
    private readonly otmRepo: Repository<OtherItem>,

    @InjectRepository(Tcomment)
    private readonly tcomRepo: Repository<Tcomment>,

    private readonly memberService: MemberService,

    private readonly mmService: MemberMaterialService,

    private readonly jobService: JobService,
  ) {}

  async create(createTicketDto: CreateTicketDto, job_name: string) {
    const { ticketItems, otherItems, ...ticketDto } = createTicketDto;

    let lastTicketId = await this.getCurrentJobLastTicketId(job_name);
    lastTicketId += 1;
    const barcode = `TI-${job_name}-${lastTicketId.toString().padStart(5, '0')}`;

    const job = await this.jobService.find(job_name);
    const ticket = await this.ticketRepo.save({
      barcode,
      ...ticketDto,
      job: { _id: job._id },
    });

    for (const ti of ticketItems) {
      const tkm = this.tkmRepo.create(ti);
      // tkm.last_update = new Date();
      tkm.ticket = ticket;
      tkm.member = { _id: ti.member_id } as Member;
      await this.tkmRepo.save(tkm);
    }

    for (const otm of otherItems) {
      const otherItem = this.otmRepo.create(otm);
      otherItem.ticket = ticket;
      await this.otmRepo.save(otherItem);
    }

    return await this.findOne(ticket.barcode);
  }
  async findAll() {
    return this.ticketRepo.find({
      select: ['barcode'],
      order: { barcode: 'ASC' },
    });
  }

  async findAllByJob(job_name: string) {
    const tickets_ = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket._id')
      .addSelect('ticket.barcode')
      .addSelect('ticket.loaded_at')
      .addSelect('ticket.delivered_at')
      .addSelect('ticket.ticket_type')
      .addSelect('ticket.contact')
      .addSelect('ticket.created_at')
      .leftJoinAndSelect('ticket.ticket_member', 'items')
      .leftJoinAndSelect('items.member', 'members')
      .leftJoinAndSelect('ticket.other_items', 'other_items')
      .leftJoinAndSelect('ticket.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'user')
      .leftJoinAndSelect('ticket.truck', 'truck')
      .where('ticket.barcode LIKE :bc', { bc: `TI-${job_name}-%` })
      .getMany();

    if (tickets_.length == 0) {
      return [];
    }

    let job_address = '...';
    try {
      const job = await this.jobService.find(job_name);

      job_address =
        `${job.address.street}, ${job.address.state} ${job.address.zip}`.replace(
          '  ',
          ' ',
        );
    } catch (error) {}

    const tickets = await Promise.all(
      tickets_.map(async (ticket) => {
        const items = await Promise.all(
          Object.values(ticket.ticket_member).map(async (mb) => {
            return {
              _id: mb._id,
              quantity: mb.quantity,
              loaded: mb.loaded,
              delivered: mb.delivered,
              piecemark: mb.member.piecemark,
              last_update: mb.last_update,
              mem_desc: `${mb.member.mem_desc} ${mb.member.main_material}`,
              weight: Math.round(await this.mmService.getWeight(mb.member._id)),
              team: mb.team,
            };
          }),
        );
        return {
          _id: ticket._id,
          loaded_at: ticket.loaded_at,
          ticket_type: ticket.ticket_type,
          delivered_at: ticket.delivered_at,
          barcode: ticket.barcode,
          contact: ticket.contact,
          created_at: ticket.created_at,
          other_items: ticket.other_items,
          items,
          truck: ticket.truck,
          tcomments: ticket.comments.map((tcomment) => {
            return {
              _id: tcomment._id,
              details: tcomment.details,
              user: tcomment.user.fullname(),
              created_at: tcomment.created_at,
            };
          }),
          job_name,
          job_address,
        };
      }),
    );

    return tickets;
  }

  async findOne(barcode: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { barcode },
      relations: {
        ticket_member: { member: true },
        other_items: true,
        comments: { user: true },
        truck: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket Not Found.\nPlease Review Ticket Number And Try Again.',
      );
    }
    ticket['items'] = await Promise.all(
      Object.values(ticket.ticket_member).map(async (mb) => {
        return {
          _id: mb._id,
          quantity: mb.quantity,
          loaded: mb.loaded,
          delivered: mb.delivered,
          piecemark: mb.member.piecemark,
          last_update: mb.last_update,
          mem_desc: `${mb.member.mem_desc} ${mb.member.main_material}`,
          weight: Math.round(await this.mmService.getWeight(mb.member._id)),
          team: mb.team,
        };
      }),
    );

    const jobName = ticket.barcode.split('-')[1];

    try {
      const job = await this.jobService.find(jobName);
      ticket['job_name'] = job.job_name;
      ticket['job_address'] =
        `${job.address.street}, ${job.address.state} ${job.address.zip}`.replace(
          '  ',
          ' ',
        );
    } catch (error) {
      ticket['job_name'] = jobName;
      ticket['job_address'] = '...';
    }

    (ticket['tcomments'] = ticket.comments.map((tcomment) => {
      return {
        _id: tcomment._id,
        details: tcomment.details,
        user: tcomment.user.fullname(),
        created_at: tcomment.created_at,
      };
    })),
      delete ticket.comments;
    delete ticket.ticket_member;
    return ticket;
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }

  async availableMembers(jobid: number) {
    const members = await this.memberService.findAll(jobid, undefined);

    // const fullyCut = members
    //   .map((member) => {
    //     const T = [];
    //     member.materials.forEach((material) => {
    //       const tn = Math.floor(material['cut'] / material.quantity);
    //       T.push(tn);
    //     });

    //     if (T.length) {
    //       const readyToWeldOrWelded = Math.min(...T);

    //       if (readyToWeldOrWelded > 0) {
    //         member.quantity = readyToWeldOrWelded;
    //         return member;
    //       }
    //     }
    //   })
    //   .filter(Boolean);

    const filteredMembers = (
      await Promise.all(
        members.map(async (mb) => {
          const count = await this.countMemberTicket(mb._id);
          if (mb.quantity > count) {
            const available = mb.quantity - count;
            delete mb.quantity;
            return {
              ...mb,
              available,
            };
          }

          return null;
        }),
      )
    ).filter(Boolean);

    //return members;
    return filteredMembers;
  }

  async countMemberTicket(member_id: number) {
    const qt = await this.tkmRepo.find({
      where: { member: { _id: member_id } },
      relations: { member: true },
      select: ['quantity'],
    });

    return qt.reduce((total, tm) => total + tm.quantity, 0);
  }

  async getCurrentJobLastTicketId(job_name: string): Promise<number> {
    const tk = await this.ticketRepo
      .createQueryBuilder()
      .select('_id', 'id')
      .addSelect('barcode')
      .where('barcode like :f', { f: `TI-${job_name}%` })
      .getRawMany();

    if (tk.length == 0) {
      return 0;
    }

    try {
      const barcodeId = tk.pop().barcode.split('-').pop();
      return Number.parseInt(barcodeId);
    } catch {
      return 0;
    }
  }

  async loadTicket(
    ticket_id: number,
    truckId: number,
    loadTicketDto: LoadTicketDto,
    partialLoad: boolean,
    userId: number,
  ) {
    const ticket = await this.ticketRepo.findOne({
      where: { _id: ticket_id },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket Not Found');
    }

    if (!partialLoad) {
      ticket.loaded_at = new Date();
      ticket.loaded__by__user = { _id: userId } as User;
    }

    ticket.truck = { _id: truckId } as Truck;

    await ticket.save();

    if (loadTicketDto.tcomments.length > 0) {
      const tcomt = this.tcomRepo.create();
      tcomt.details = loadTicketDto.tcomments.pop().details;
      tcomt.user = { _id: userId } as User;
      tcomt.ticket = ticket;
      await tcomt.save();
    }

    try {
      for (const { _id, loaded } of loadTicketDto.items) {
        const tkm = await this.tkmRepo.findOne({
          where: { _id, ticket: { _id: ticket_id } },
          relations: { member: true },
        });

        if (loaded > tkm.loaded) {
          // await this.memberService.moveToArea(5, [
          //   {
          //     id: tkm.member._id,
          //     quantity: loaded - tkm.loaded,
          //   },
          // ]);
        }
        tkm.loaded = loaded;
        tkm.last_update = new Date();
        tkm.user = { _id: 1 } as User;
        await tkm.save();
      }

      for (const { _id, loaded } of loadTicketDto.other_items) {
        const otm = await this.otmRepo.findOne({
          where: { _id, ticket: { _id: ticket_id } },
        });
        otm.loaded = loaded;
        otm.last_update = new Date();
        otm.user = { _id: 1 } as User;
        await otm.save();
      }
    } catch (error) {}
  }

  async deliveredTicket(
    ticket_id: number,
    loadTicketDto: LoadTicketDto,
    partial: boolean,
    userId: number,
  ) {
    const ticket = await this.ticketRepo.findOne({ where: { _id: ticket_id } });
    if (!ticket) {
      throw new NotFoundException('Ticket Not Found');
    }

    if (!partial) {
      ticket.delivered_at = new Date();
      ticket.received__by__user = { _id: userId } as User;
    }
    await ticket.save();

    if (loadTicketDto.tcomments.length > 0) {
      const tcomt = this.tcomRepo.create();
      tcomt.details = loadTicketDto.tcomments.pop().details;
      tcomt.user = { _id: userId } as User;
      tcomt.ticket = ticket;
      await tcomt.save();
    }

    try {
      for (const { _id, delivered } of loadTicketDto.items) {
        const tkm = await this.tkmRepo.findOne({
          where: { _id, ticket: { _id: ticket_id } },
          relations: { member: true },
        });

        if (delivered > tkm.delivered) {
          // await this.memberService.moveToArea(6, [
          //   {
          //     id: tkm.member._id,
          //     quantity: delivered - tkm.delivered,
          //   },
          // ]);
        }
        tkm.delivered = delivered;
        tkm.last_update = new Date();
        tkm.user = { _id: 1 } as User;
        await tkm.save();

        // tkm.delivered = delivered;
        // await tkm.save();

        // await this.memberService.moveToArea(6, [
        //   {
        //     id: tkm.member._id,
        //     quantity: delivered,
        //   },
        // ]);
      }

      for (const { _id, delivered } of loadTicketDto.other_items) {
        const otm = await this.otmRepo.findOne({
          where: { _id, ticket: { _id: ticket_id } },
        });
        otm.delivered = delivered;
        await otm.save();
      }
    } catch (error) {}
  }
}
