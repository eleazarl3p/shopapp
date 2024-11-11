import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Criteria } from './criteria.entity';
import { MaterialInspection, MemberInspection } from './inspection.entity';

@Entity()
export class InspectionCriteria extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @ManyToOne(() => Criteria)
  criteria: Criteria;

  @Column({ type: 'enum', enum: ['Yes', 'No', 'N/A'], default: 'N/A' })
  answer: string;

  @ManyToOne(() => MaterialInspection, (mi) => mi.criteriaAnswers, {
    nullable: true,
  })
  materialInpection: MaterialInspection;

  @ManyToOne(() => MemberInspection, (mb) => mb.criteriaAnswers, {
    nullable: true,
  })
  memberInpection: MemberInspection;
}
