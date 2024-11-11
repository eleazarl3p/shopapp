import { Area } from 'src/area/entities/area.entity';
import { User } from 'src/user/entities/user.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Level {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  rank: number;

  @ManyToMany(() => Area)
  @JoinTable()
  areas: Area[];

  @OneToMany(() => User, (user) => user.level)
  users: User[];
}
