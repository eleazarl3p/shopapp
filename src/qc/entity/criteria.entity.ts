import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Criteria extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  question: string;

  @Column()
  rank: number;
}
