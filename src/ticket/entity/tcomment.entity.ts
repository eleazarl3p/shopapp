import { Ticket } from 'src/ticket/entity/ticket.entity';
import { User } from 'src/user/entities/user.entity';

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Tcomment extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  details: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.comments, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
