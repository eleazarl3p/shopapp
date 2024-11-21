import { InjectRepository } from '@nestjs/typeorm';
import { MemberMaterial } from './entities/membermaterial.entity';
import { Repository } from 'typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class MemberMaterialService {
  constructor(
    @InjectRepository(MemberMaterial)
    private readonly mmRepo: Repository<MemberMaterial>,

    @Inject(forwardRef(() => TaskService))
    private taskService: TaskService,
  ) {}

  async create(mm: MemberMaterial) {
    return this.mmRepo.save(mm);
  }

  async findOne(
    member_id: number,
    material_id: number,
  ): Promise<MemberMaterial> {
    return await this.mmRepo.findOne({ where: { member_id, material_id } });
  }

  async getWeight(member_id: number) {
    const materials = await this.mmRepo.find({
      where: { member_id },
      relations: { material: true },
    });

    return materials.reduce(
      (total, mm) => total + mm.quantity * mm.material.weight,
      0,
    );
  }

  async countMaterials(material_id: number) {
    const mbmtrl = await this.mmRepo.find({
      where: { material_id },
      relations: {
        member: {
          tasks: {
            items: {
              cut_history: {
                user: true,
                inspection: true,
                task_item: { machine: true },
              },
              material: true,
            },
          },
        },
        material: true,
      },
    });

    const materials = mbmtrl.map((mm) => {
      return {
        ...mm.material,
        quantity: mm.quantity * mm.member.quantity,
        cut_history: mm.member.tasks.flatMap((tsk) => {
          const itm = tsk.items.filter(
            (it) => it.material._id == mm.material._id,
          );
          return itm.flatMap((c) => {
            return c.cut_history.map((ct) => {
              const ht = {
                ...ct,
                user: ct.user ? ct.user.fullname() : '..9.',
                inspection_link: ct.inspection ? ct.inspection.report_link : '',
                machine: ct.task_item.machine.name,
              };

              const { inspection, task_item, ...all } = ht;
              return all;
            });
          });
        }),
      };
    });

    return materials.reduce(
      (acc, m) => {
        if (!acc[m._id]) {
          acc[m._id] = {
            ...m,
            quantity: 0,
            cut_history: [],
          };
        }
        acc[m._id].quantity += m.quantity;
        acc[m._id].cut_history = acc[m._id].cut_history.concat(m.cut_history);
        return acc;
      },
      {} as Record<number, any>,
    );
  }

  async countMaterialsGivenMember(material_id: number, member_id: number) {
    const mbmtrl = await this.mmRepo.find({
      where: { material_id, member_id },
      relations: {
        member: { tasks: { items: { cut_history: true, material: true } } },
        material: true,
      },
    });

    return mbmtrl
      .map((mm) => {
        return {
          ...mm.material,
          quantity: mm.quantity, //* mm.member.quantity,
          cut_history: mm.member.tasks.flatMap((tsk) => {
            const itm = tsk.items.filter(
              (it) => it.material._id == mm.material._id,
            );
            return itm.flatMap((c) => {
              return c.cut_history.map((ct) => {
                return {
                  ...ct,
                  user: ct.user ? ct.user.fullname() : '...',
                };
              });
              // return {
              //   _id: c._id,
              //   assigned: c.assigned,
              //   cut_history: c.cut_history.map((ct) => {
              //     return {
              //       ...ct,
              //       user: ct.user ? ct.user.fullname() : '...',
              //     };
              //   }),
              // };
            });
          }),
          //.flatMap((res) => res.cut_history),
        };
      })
      .pop();
  }
}
