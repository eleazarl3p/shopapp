import { Truck } from 'src/truck/entities/truck.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaintTicketHistory } from './paint-ticket-history.entity';

export enum paintingType {
  'GALVANIZED' = 'GALVANIZED',
  'NGALVANIZED' = 'NOTGALVANIZED',
}

@Entity()
export class PaintTicket {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'enum', enum: paintingType })
  painting_type: paintingType;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => Truck)
  truck: Truck;

  @OneToMany(() => PaintTicketHistory, (pth) => pth.ticket)
  history: PaintTicketHistory[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}