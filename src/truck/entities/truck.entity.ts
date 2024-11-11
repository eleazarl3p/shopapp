import {
  BaseEntity,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Truck extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  barcode: string;

  @DeleteDateColumn({ type: 'datetime' })
  delete_at?: Date;
}
