import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MaterialInspection, MemberInspection } from './inspection.entity';

export enum iStatus {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  CLOSE = 'CLOSE',
}
@Entity()
export class InspectionStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ type: 'enum', enum: iStatus })
  status: iStatus;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MaterialInspection, (mai) => mai.i_status, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  material_inspection: MaterialInspection;

  @ManyToOne(() => MemberInspection, (mbi) => mbi.i_status, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  member_inspection: MemberInspection;
}
