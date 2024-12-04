import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaintTicket } from './paint-ticket.entity';

export type HAction = 'OUT' | 'IN';

@Entity()
export class PaintTicketHistory {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'varchar' })
  action: HAction;

  @ManyToOne(() => PaintTicket, (pt) => pt.history)
  ticket: PaintTicket;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;
}
