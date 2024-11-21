import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskItem } from './task-item.entity';

import { MaterialInspection } from 'src/qc/entity/inspection.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class CutHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  approved: number;

  @Column({ default: '' })
  comments: string;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  review_date: Date;

  @ManyToOne(() => TaskItem, (ti) => ti.cut_history, {
    onDelete: 'CASCADE',
  })
  task_item: TaskItem;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  user: User;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  reviewed_by: User;

  @OneToOne(() => MaterialInspection)
  @JoinColumn()
  inspection: MaterialInspection;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
