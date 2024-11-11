import { Material } from 'src/material/entities/material.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { Machine } from 'src/machine/entities/machine.entity';
import { CutHistory } from './cut-history.entity';

@Entity()
export class TaskItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  assigned: number;

  @ManyToOne(() => Material, (material) => material.task_items, {
    onDelete: 'CASCADE',
  })
  material: Material;

  @ManyToOne(() => Task, (task) => task.items, {
    onDelete: 'CASCADE',
  })
  task: Task;

  @ManyToOne(() => Machine, (machine) => machine.tasks_items, {
    onDelete: 'SET NULL',
  })
  machine: Machine;

  @OneToMany(() => CutHistory, (ch) => ch.task_item)
  cut_history: CutHistory[];
}
