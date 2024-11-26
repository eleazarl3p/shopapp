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
import { TaskArea } from './taskarea.entity';
import { User } from 'src/user/entities/user.entity';
import { MemberInspection } from 'src/qc/entity/inspection.entity';

@Entity()
export class TaskAreaHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  //   @Column()
  //   quantity: number;

  @Column({ default: 0 })
  completed: number;

  @Column({ nullable: true })
  approved: boolean;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  reviewed_by: User;

  @ManyToOne(() => TaskArea, (ta) => ta.history, {
    onDelete: 'CASCADE',
  })
  task_area: TaskArea;

  @OneToOne(() => MemberInspection)
  @JoinColumn()
  inspection: MemberInspection;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  date_approval: Date;
}
