import {
  BaseEntity,
  BeforeRemove,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { Member } from 'src/member/entities/member.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class TicketMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  quantity: number;

  @Column({ default: 0 })
  loaded: number;

  @Column({ default: 0 })
  delivered: number;

  @ManyToOne(() => Member, (member) => member.ticket_member, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  member: Member;

  @ManyToOne(() => Ticket, (tk) => tk.ticket_member, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column({ type: 'datetime', nullable: true })
  last_update: Date | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;
}
