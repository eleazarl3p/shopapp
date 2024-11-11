import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberMaterialService } from './membermaterial.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,

    private readonly mmService: MemberMaterialService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    try {
      const member = await this.memberRepo.save(createMemberDto);
      return member;
    } catch (error) {}
  }

  async findAll(job_id: number, paquete_id: number) {
    let members: Member[];

    try {
      members = await this.memberRepo.find({
        where: {
          paquete: { _id: paquete_id, job: { _id: job_id } },
        },
        relations: {
          paquete: { job: true },
          member_material: { material: true },
          tasks: {
            items: { material: true, cut_history: true },
            task_area: { history: true },
          },
        },
        order: {
          //tasks: { items: { last_update: 'asc' } },
        },
      });
    } catch {
      throw new BadRequestException('Invalid paquete id');
    }

    return await Promise.all(
      members.map(async (member) => {
        return await this.findOne(member._id);
      }),
    );
  }

  async findMember(_id: number) {
    const member = await this.memberRepo.findOne({
      where: { _id },
      relations: { member_material: { material: true } },
    });

    const groupedMaterials = member.member_material.reduce(
      (acc, mm) => {
        if (!acc[mm.material.piecemark]) {
          acc[mm.material.piecemark] = {
            ...mm.material,
            quantity: 0,
          };
        }
        acc[mm.material.piecemark].quantity += mm.quantity;
        return acc;
      },
      {} as Record<string, any>,
    );
    return {
      ...member,
      materials: Object.values(groupedMaterials),
    };
  }

  async findOne(_id: number) {
    const member = await this.memberRepo.findOne({
      where: { _id },
      relations: {
        member_material: { material: true },
        paquete: true,
        tasks: {
          items: { material: true, cut_history: true },
          task_area: { history: { user: true, reviewed_by: true }, area: true },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const weight = await this.mmService.getWeight(member._id);

    const groupedMaterials = await Promise.all(
      member.member_material.map(async (mat) => {
        return this.mmService.countMaterialsGivenMember(mat.material_id, _id);
      }),
    );

    //return groupedMaterials;
    // const groupedMaterials = member.member_material.reduce(
    //   (acc, mm) => {
    //     if (!acc[mm.material.piecemark]) {
    //       acc[mm.material.piecemark] = {
    //         ...mm.material,
    //         quantity: 0,
    //         cut: 0,
    //         last_update: null,
    //       };
    //     }
    //     acc[mm.material.piecemark].quantity += mm.quantity;
    //     return acc;
    //   },
    //   {} as Record<string, any>,
    // );

    // if (member.tasks.length) {
    //   for (const task of member.tasks) {
    //     for (const item of task.items) {
    //       const piecemark = item.material.piecemark;
    //       if (groupedMaterials[piecemark]) {
    //         groupedMaterials[piecemark].cut += item.cut_history.reduce(
    //           (acc, c) => (acc += c.approved),
    //           0,
    //         );

    //         if (!groupedMaterials[piecemark].last_update) {
    //           const ld = item.cut_history
    //             .sort(
    //               (a, b) =>
    //                 new Date(b.last_update).getTime() -
    //                 new Date(a.last_update).getTime(),
    //             )
    //             .pop();
    //           if (ld) {
    //             groupedMaterials[piecemark].last_update = ld.last_update;
    //           }
    //         } else {
    //           const lastDate = new Date(
    //             groupedMaterials[piecemark].last_update,
    //           );
    //           const currentDate = item.cut_history
    //             .sort(
    //               (a, b) =>
    //                 new Date(b.last_update).getTime() -
    //                 new Date(a.last_update).getTime(),
    //             )
    //             .pop();
    //           if (
    //             currentDate &&
    //             new Date(currentDate.last_update).getTime() > lastDate.getTime()
    //           ) {
    //             groupedMaterials[piecemark].last_update = lastDate;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    //member.member_material = Object.values(groupedMaterials);
    const newMember = {
      _id: member._id,
      barcode: member.barcode,
      piecemark: member.piecemark,
      mem_desc: `${member.mem_desc} ${member.main_material}`,
      quantity: member.quantity,
      weight: Math.round(weight),
      materials: groupedMaterials,
      areas: !member.tasks.length
        ? []
        : Object.values(
            member.tasks
              .flatMap((t) => t.task_area)
              .flatMap((ta) => {
                return ta.history
                  .map((h) => {
                    if (h.approved) {
                      return {
                        area: ta.area.name,
                        user: h.user.fullname(),
                        reviewed_by:
                          h.reviewed_by != null ? h.reviewed_by.fullname() : '',
                        date_of_approval: h.date_approval,
                      };
                    }
                  })
                  .filter(Boolean);
              })
              .reduce(
                (acc, h) => {
                  if (!acc[h.area]) {
                    acc[h.area] = {
                      area: h.area,
                      user: h.user,
                      reviewed_by: h.reviewed_by,
                      date_of_approval: h.date_of_approval,
                      quantity: 0,
                    };
                  }

                  acc[h.area].quantity += 1;
                  const dateA = new Date(
                    acc[h.area].date_of_approval,
                  ).getTime();
                  const dateB = new Date(h.date_of_approval).getTime();
                  if (dateA < dateB)
                    acc[h.area].date_of_approval = h.date_of_approval;

                  return acc;
                },
                {} as Record<string, any>,
              ),
          ),
    };
    // Object.values(
    //   member.tasks[0].task_area

    // ),
    // const ma = newMember.areas.reduce(
    //   (acc, ma) => {
    //     if (!acc[ma.area._id]) {
    //       acc[ma.area._id] = {
    //         ...ma,
    //         quantity: 0,
    //       };
    //     }

    //     acc[ma.area._id].quantity += ma.quantity;
    //     acc[ma.area._id].created_at = ma.created_at;

    //     return acc;
    //   },
    //   {} as Record<number, any>,
    // );
    // newMember.areas = Object.values(ma);
    return newMember;
  }

  async findOneBy(barcode: string): Promise<Member> {
    return await this.memberRepo.findOne({
      where: { barcode },
      relations: ['paquete'],
    });
  }

  async getBarcodes(paquete_id: number) {
    const barcodes = await this.memberRepo.find({
      where: { paquete: { _id: paquete_id } },
      relations: { paquete: true },
      select: ['barcode'],
    });

    return barcodes.map((result) => result.barcode);
  }

  async memberNotYetAssignedToTeam(paquete_id: number) {
    try {
      return await this.memberRepo
        .createQueryBuilder('member')
        .leftJoin('member.tasks', 'task')
        .leftJoin('member.paquete', 'paquete')
        .select('member._id', 'member_id')
        // .addSelect('member.mem_desc', "desc")
        // .addSelect('member.main_material', "main_material")
        .addSelect(
          "CONCAT(member.mem_desc, ' ', member.main_material)",
          'details',
        )
        .addSelect('member.piecemark', 'piecemark')
        .addSelect('member.quantity', 'total')
        .addSelect(
          'COALESCE(member.quantity - COUNT(task._id), member.quantity)',
          'pending',
        )
        .where('member.paquete_id = :paquete_id', { paquete_id })
        .groupBy('member._id')
        // .having('COALESCE(SUM(task.quantity), 0) < member.quantity')
        .having('COALESCE(COUNT(task._id), 0) < member.quantity')
        .getRawMany();
    } catch (error) {
      throw new BadRequestException(error.code);
    }
  }

  // async availableMembers(jobId: number, paqueteId: number, areaId: number) {
  //   const members = await this.findAll(jobId, paqueteId);

  //   const fullyCut = members
  //     .map((member) => {
  //       const T = [];
  //       member.materials.forEach((material) => {
  //         const totCut = material.cut_history.reduce(
  //           (acc, cut) => (acc += cut.quantity),
  //           0,
  //         );
  //         const tn = Math.floor(totCut / material.quantity);
  //         T.push(tn);
  //       });
  //       if (T.length) {
  //         const fc = Math.min(...T);
  //         if (fc > 0) {
  //           member.quantity = fc;
  //           return member;
  //         }
  //       }
  //     })
  //     .filter(Boolean);

  //   return fullyCut;

  //   // const groupArea = fullyCut.map((member) => {
  //   //   const ma = member.areas.reduce(
  //   //     (acc, ma) => {
  //   //       if (!acc[ma.area._id]) {
  //   //         acc[ma.area._id] = {
  //   //           ...ma,
  //   //           quantity: 0,
  //   //         };
  //   //       }
  //   //       acc[ma.area._id].quantity += ma.quantity;
  //   //       // acc[ma.area._id].created_at = ma.created_at;
  //   //       return acc;
  //   //     },
  //   //     {} as Record<number, any>,
  //   //   );
  //   //   member.areas = Object.values(ma);
  //   //   return member;
  //   // });
  //   // return groupArea
  //   //   .map((mm) => {
  //   //     const am = mm.areas.filter((a) => a.area._id == areaId);
  //   //     if (!am) {
  //   //       return mm;
  //   //     }

  //   //     const totToArea = am.reduce((acc, ar) => (acc += ar.quantity), 0);

  //   //     if (totToArea < mm.quantity) {
  //   //       mm.quantity -= totToArea;
  //   //       return mm;
  //   //     }
  //   //   })
  //   //   .filter(Boolean);
  // }

  updateByCode(barcode: string, updateMemberDto: UpdateMemberDto) {
    this.memberRepo.update({ barcode }, { ...updateMemberDto });
  }
}
