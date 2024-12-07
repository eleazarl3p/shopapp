import { Truck } from 'src/truck/entities/truck.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaintTicketHistory } from './paint-ticket-history.entity';
import { TaskArea } from 'src/task/entities/taskarea.entity';

export enum paintingType {
  'GALVANIZED' = 'GALVANIZED',
  'NGALVANIZED' = 'NOTGALVANIZED',
}

@Entity()
export class PaintTicket extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'enum', enum: paintingType })
  painting_type: paintingType;

  @Column({ nullable: true })
  barcode: string;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => Truck)
  truck: Truck;

  @OneToMany(() => PaintTicketHistory, (pth) => pth.ticket)
  history: PaintTicketHistory[];

  @OneToMany(() => TaskArea, (ta) => ta.paint_ticket)
  task_area: TaskArea[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
