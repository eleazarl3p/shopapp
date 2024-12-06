import { Member } from 'src/member/entities/member.entity';
import { Team } from 'src/team/entities/team.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskItem } from './task-item.entity';
import { TaskArea } from './taskarea.entity';
import { PaintTicket } from 'src/paint-ticket/entities/paint-ticket.entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  // @Column()
  // quantity: number;

  @Column({ type: 'datetime' })
  expected_date: Date;

  @Column({ type: 'datetime' })
  estimated_date: Date;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @ManyToOne(() => Team, (team) => team.tasks, {
    onDelete: 'SET NULL',
  })
  team: Team;

  @OneToMany(() => TaskItem, (item) => item.task)
  items: TaskItem[];

  @OneToMany(() => TaskArea, (ta) => ta.task)
  task_area: TaskArea[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
