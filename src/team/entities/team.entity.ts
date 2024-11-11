import { Task } from 'src/task/entities/task.entity';
import { User } from 'src/user/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Task, (task) => task.team)
  tasks: Task[];

  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @DeleteDateColumn({ type: 'datetime' })
  deleted_at: Date;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}

//src/specialuser/entity/user.entity
