import { TaskArea } from 'src/task/entities/taskarea.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Area {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ default: 'xmark' })
  image: string;

  @Column({ unique: true })
  rank: number;

  @OneToMany(() => TaskArea, (ta) => ta.area)
  task_area: TaskArea[];
}
