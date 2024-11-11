import { Paquete } from 'src/paquete/entities/paquete.entity';
import {
  BaseEntity,
  BeforeRemove,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberMaterial } from './membermaterial.entity';
import { TicketMember } from 'src/ticket/entity/tiketmember.entity';
import { Task } from 'src/task/entities/task.entity';

@Entity()
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  idx_pcmk: number;

  @Column()
  main_material: string;

  @Column()
  piecemark: string;

  @Column({ unique: true })
  barcode: string;

  @Column()
  mem_desc: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Paquete, (paquete) => paquete.members, {
    onDelete: 'CASCADE',
  })
  paquete: Paquete;

  @CreateDateColumn({ type: 'datetime' })
  create_date: Date;

  @OneToMany(() => MemberMaterial, (mm) => mm.member)
  member_material: MemberMaterial[];

  @OneToMany(() => TicketMember, (tm) => tm.member)
  ticket_member: TicketMember[];

  @OneToMany(() => Task, (tsk) => tsk.member)
  tasks: Task[];
}
