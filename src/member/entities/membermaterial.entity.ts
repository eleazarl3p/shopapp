import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Material } from 'src/material/entities/material.entity';

@Entity()
export class MemberMaterial extends BaseEntity {
  @PrimaryGeneratedColumn()
  public mm_id: number;

  @ManyToOne(() => Member, (member) => member.member_material, {
    onDelete: 'CASCADE',
  })
  public member: Member;

  @ManyToOne(() => Material, (material) => material.member_material, {
    onDelete: 'CASCADE',
  })
  public material: Material;

  @Column()
  public material_id: number;

  @Column()
  public quantity: number;

  @Column()
  public member_id: number;
}

// @Entity()
// export class MemberMaterial extends BaseEntity {
//   @PrimaryGeneratedColumn()
//   public mm_id: number;

//   @Column()
//   public member_id: number;

//   @Column()
//   public material_id: number;

//   @Column()
//   public quantity: number;

//   @ManyToOne(() => Member, (member) => member.member_material)
//   public member: Member;

//   @ManyToOne(() => Material, (material) => material.member_material)
//   public material: Material;
// }
