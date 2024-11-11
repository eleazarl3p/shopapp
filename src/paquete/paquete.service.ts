import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/update-paquete.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paquete } from './entities/paquete.entity';
import { Repository } from 'typeorm';
import { MemberService } from 'src/member/member.service';
import { JobService } from 'src/job/job.service';
import { NotFoundError } from 'rxjs';
import { Job } from 'src/job/entites/job.entity';
import { MaterialService } from 'src/material/material.service';
import { MemberMaterial } from 'src/member/entities/membermaterial.entity';
import { MemberMaterialService } from 'src/member/membermaterial.service';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class PaqueteService {
  constructor(
    @InjectRepository(Paquete)
    private readonly paqueteRepo: Repository<Paquete>,

    private readonly jobService: JobService,
    private readonly memberService: MemberService,
    private readonly materialService: MaterialService,
    private readonly mmService: MemberMaterialService,
  ) {}
  async create(job_id: number, createPaqueteDto: CreatePaqueteDto) {
    const job = await this.jobService.findById(job_id);
    if (!job) throw new NotFoundException('Job not found');

    const { members, ...paqueteDto } = createPaqueteDto;

    let paquete: Paquete = undefined;
    try {
      paquete = await this.paqueteRepo.save(paqueteDto);
      job.paquetes.push(paquete);
      await job.save();
    } catch (error) {
      await this.remove(paquete._id);
      throw new ConflictException("Package's name is taken");
    }

    if (members.length == 0) {
      return [];
    }

    const ppk = await this.findOne(paquete._id);

    for (const member of members) {
      member['barcode'] =
        `M${job.job_name}-${member.piecemark.padStart(6, '0')}`;
      try {
        const newMember = await this.memberService.create(member);
        ppk.members.push(newMember);

        for (const mat of member.materials) {
          const barcode = `W${job.job_name}-${mat.piecemark.padStart(6, '0')}`;
          let material = await this.materialService.find(barcode);

          if (!material) {
            mat['barcode'] = barcode;
            material = await this.materialService.create(mat, paquete._id);
          }

          const mm_ = await this.mmService.findOne(newMember._id, material._id);

          if (!mm_) {
            const mm = new MemberMaterial();
            mm.member = newMember;
            mm.material = material;
            mm.quantity = mat.quantity;
            await this.mmService.create(mm);
          }
        }
      } catch (error) {
        //const barcode = `M${job.job_name}-${member.piecemark.padStart(6, '0')}`;
        //this.memberService.updateByCode(barcode, { ...member });
      }
    }
    await ppk.save();
    return await this.getBarcode(paquete._id);
  }

  findAll() {
    return `This action returns all paquete`;
  }

  async findOne(_id: number) {
    return await this.paqueteRepo.findOne({
      where: { _id },
      relations: { members: true, job: true },
      order: { members: { piecemark: 'ASC' } },
    });
  }

  async update(id: number, updatePaqueteDto: UpdatePaqueteDto) {
    const paquete = await this.findOne(id);

    if (paquete == null) {
      throw new NotFoundException();
    }

    const { members } = updatePaqueteDto;

    for (const member of members) {
      try {
        const mbrbarcode = `M${paquete.job.job_name}-${member.piecemark.padStart(6, '0')}`;
        let currentMember = await this.memberService.findOneBy(mbrbarcode);

        if (!currentMember) {
          member['barcode'] = mbrbarcode;
          currentMember = await this.memberService.create(member);
          paquete.members.push(currentMember);
        }

        for (const mat of member.materials) {
          const mtrlbarcode = `W${paquete.job.job_name}-${mat.piecemark.padStart(6, '0')}`;
          let material = await this.materialService.find(mtrlbarcode);

          if (!material) {
            mat['barcode'] = mtrlbarcode;
            material = await this.materialService.create(mat, paquete._id);
          }

          const mm = await this.mmService.findOne(
            currentMember._id,
            material._id,
          );

          if (!mm) {
            const mm = new MemberMaterial();
            mm.member = currentMember;
            mm.material = material;
            mm.quantity = mat.quantity;
            await this.mmService.create(mm);
          }
        }
      } catch (error) {
        // const barcode = `M${job.job_name}-${member.piecemark.padStart(5, '0')}`;
        // this.memberService.updateByCode(barcode, { ...member });
      }
    }
    paquete.url_3d = updatePaqueteDto.url_3d;
    paquete.url_drawings = updatePaqueteDto.url_drawings;
    await paquete.save();
    return await this.getBarcode(paquete._id);
  }

  async remove(_id: number) {
    try {
      return await this.paqueteRepo.delete({ _id });
    } catch (error) {}
  }

  async getBarcode(id: number) {
    const memberBarcodes = await this.memberService.getBarcodes(id);
    const materialBarcodes =
      await this.materialService.getBarcodesByPaquete(id);
    return memberBarcodes.concat(materialBarcodes);
  }
}
