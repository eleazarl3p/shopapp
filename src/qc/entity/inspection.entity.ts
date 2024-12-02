import { SpecialUser } from 'src/specialuser/entity/special-user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InspectionCriteria } from './inspection-criteria.entity';
import { InspectionStatus } from './inspection-status.entity';

export enum fitUpInspection {
  INPROGRESS = 'In Progress',
  PASS = 'PASS',
  FAIL = 'FAIL',
}

@Entity()
export class MaterialInspection {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  job: string;

  @Column()
  inspection_type: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ type: 'enum', enum: fitUpInspection })
  fit_up_inspection: fitUpInspection;

  @Column({ type: 'boolean', default: false })
  non_conformance: boolean;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ default: '' })
  report_link: string;

  @ManyToOne(() => SpecialUser)
  inspector: SpecialUser;

  @ManyToOne(() => SpecialUser)
  fabricator: SpecialUser;

  @OneToMany(() => InspectionCriteria, (ic) => ic.materialInpection)
  criteriaAnswers: InspectionCriteria[];

  @OneToMany(() => InspectionStatus, (is) => is.material_inspection)
  i_status: InspectionStatus[];
}

@Entity()
export class MemberInspection {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  job: string;

  @Column()
  inspection_type: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ type: 'enum', enum: fitUpInspection })
  fit_up_inspection: fitUpInspection;

  @Column({ type: 'boolean', default: false })
  non_conformance: boolean;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ default: '' })
  report_link: string;

  @ManyToOne(() => SpecialUser)
  inspector: SpecialUser;

  @ManyToOne(() => SpecialUser)
  fabricator: SpecialUser;

  @OneToMany(() => InspectionCriteria, (ic) => ic.memberInpection)
  criteriaAnswers: InspectionCriteria[];

  @OneToMany(() => InspectionStatus, (is) => is.member_inspection)
  i_status: InspectionStatus[];
}
