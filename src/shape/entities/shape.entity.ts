import { Machine } from 'src/machine/entities/machine.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Shape {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Machine, (mc) => mc.shapes)
  machines: Machine[];
}
