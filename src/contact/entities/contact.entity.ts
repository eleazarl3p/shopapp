import { Job } from 'src/job/entites/job.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum contactRole {
  INSTALLER = 'INSTALLER',
  GC = 'GC',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'enum', enum: contactRole })
  contact_role: string;

  @OneToMany(() => Job, (job) => job.installer)
  installed_job: Job[];

  @OneToMany(() => Job, (job) => job.installer)
  gc_job: Job[];

  fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  @DeleteDateColumn({ type: 'datetime' })
  delete_at: Date;
}
