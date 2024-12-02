import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaintingTicket } from './painting-ticket.entity';

export type HAction = 'OUT' | 'IN';

@Entity()
export class PaintingTicketHistory {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'varchar' })
  action: HAction;

  @ManyToOne(() => PaintingTicket, (pt) => pt.history)
  ticket: PaintingTicket;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;
}
