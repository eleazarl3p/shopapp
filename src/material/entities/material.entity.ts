import { MemberMaterial } from 'src/member/entities/membermaterial.entity';
import { Paquete } from 'src/paquete/entities/paquete.entity';
import { TaskItem } from 'src/task/entities/task-item.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Material extends BaseEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ unique: true })
  barcode: string;

  @Column()
  guid: string;

  @Column({ type: 'float', precision: 10, scale: 4 })
  length: number;

  @Column()
  mark: string;

  @Column()
  piecemark: string;

  @Column()
  material_grade: string;

  @Column()
  material_type: string;

  @Column()
  mtrl_idx: number;

  @Column()
  remark: string;

  @Column()
  section: string;

  @Column()
  zone: string;

  @Column()
  sub_mtrl_idx: number;

  @Column({ type: 'float', precision: 10, scale: 4 })
  weight: number;

  @Column({ type: 'float', precision: 10, scale: 4 })
  width: number;

  @OneToMany(() => MemberMaterial, (mm) => mm.material)
  member_material: MemberMaterial[];

  @OneToMany(() => TaskItem, (ti) => ti.material)
  task_items: TaskItem[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @ManyToOne(() => Paquete, (paquete) => paquete.materials, {
    onDelete: 'CASCADE',
  })
  paquete: Paquete;

  dbt() {
    const [d, b] = this.section
      .match(/(\d+)x(\d+)/)
      .slice(1, 3)
      .map(Number);

    let t = undefined;

    try {
      const [t1, t2, t3] = this.section
        .match('([0-9]+)\\s([0-9]+)/([0-9]+)$')
        .slice(1, 4)
        .map(Number);
      t = (t1 + t2 / t3).toFixed(2);
    } catch {
      try {
        const [t1, t2] = this.section
          .match('([0-9]+)/([0-9]+)$')
          .slice(1, 3)
          .map(Number);
        t = (t1 / t2).toFixed(2);
      } catch {
        [t] = this.section.match('([0-9]+)$').slice(0, 1).map(Number);
      }
    }

    return [d, b, t];
  }

  public gsr() {
    let g = undefined;
    try {
      const [g1, g2, g3] = this.section
        .match('([0-9]+)\\s([0-9]+)/([0-9]+)x')
        .slice(1, 4)
        .map(Number);
      g = (g1 + g2 / g3).toFixed(2);
    } catch {
      try {
        const [g1, g2] = this.section
          .match('([0-9]+)/([0-9]+)x')
          .slice(1, 3)
          .map(Number);
        g = (g1 / g2).toFixed(2);
      } catch {
        [g] = this.section.match('([0-9]+)x').slice(1, 2).map(Number);
      }
    }

    return g;
  }
}
