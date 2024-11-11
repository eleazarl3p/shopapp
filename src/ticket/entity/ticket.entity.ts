import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketMember } from './tiketmember.entity';

import { OtherItem } from './other-item.entity';

import { Truck } from 'src/truck/entities/truck.entity';
import { Tcomment } from './tcomment.entity';
import { Job } from 'src/job/entites/job.entity';
import { User } from 'src/user/entities/user.entity';

export enum ticketType {
  ERECT = 'ERECT',
  DELIVER = 'DELIVER',
}

@Entity()
export class Ticket extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'enum', enum: ticketType, default: ticketType.ERECT })
  ticket_type: string;

  @Column()
  barcode: string;

  @Column()
  contact: string;

  @OneToMany(() => Tcomment, (comment) => comment.ticket)
  comments: Tcomment[];

  @OneToMany(() => TicketMember, (tk) => tk.ticket)
  ticket_member: TicketMember;

  @OneToMany(() => OtherItem, (ot) => ot.ticket)
  other_items: OtherItem[];

  @ManyToOne(() => User, (usr) => usr.tickets, { onDelete: 'SET NULL' })
  created__by__user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  loaded__by__user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  received__by__user: User;

  @ManyToOne(() => Truck, {
    onDelete: 'SET NULL',
  })
  truck: Truck;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  job: Job;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  loaded_at: Date;

  @Column({ type: 'datetime', nullable: true })
  delivered_at: Date;
}
