import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Task } from './task.entity';
import { Area } from 'src/area/entities/area.entity';

import { TaskAreaHistory } from './taskarea-history';

@Entity()
@Unique(['task_id', 'area_id'])
export class TaskArea extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  task_id: number;

  @Column()
  area_id: number;

  @Column({ default: false })
  on_hold: boolean;

  @ManyToOne(() => Task, (task) => task.task_area, {
    onDelete: 'CASCADE',
  })
  task: Task;

  @ManyToOne(() => Area, (area) => area.task_area, {
    onDelete: 'CASCADE',
  })
  area: Area;

  @OneToMany(() => TaskAreaHistory, (tah) => tah.task_area)
  history: TaskAreaHistory[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
