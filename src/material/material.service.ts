import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';
import { MemberMaterialService } from 'src/member/membermaterial.service';
import { Paquete } from 'src/paquete/entities/paquete.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,

    private readonly mmService: MemberMaterialService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto, paqueteId: number) {
    try {
      const material = this.materialRepo.create(createMaterialDto);
      material.paquete = { _id: paqueteId } as Paquete;
      return await material.save();
      // newMaterial.barcode = `W${}-${newMaterial.piecemark.padStart(5, '0')}`;
      // return await this.materialRepo.save(newMaterial);
    } catch (error) {
      throw new ConflictException();
    }
  }

  async findAll(jobId: number) {
    const materials = await this.materialRepo.find({
      where: {
        member_material: { member: { paquete: { job: { _id: jobId } } } },
      },
    });

    const m = await Promise.all(
      materials.map(async (mat) => {
        return await this.mmService.countMaterials(mat._id);
      }),
    );

    return m.map((obj) => Object.values(obj)[0]);
  }

  async find(barcode: string): Promise<Material> {
    return await this.materialRepo.findOne({ where: { barcode } });
  }

  async findOne(barcode: string) {
    const material = await this.materialRepo.findOne({ where: { barcode } });
    if (!material) {
      throw new NotFoundException();
    }

    const m = await this.mmService.countMaterials(material._id);

    return Object.values(m).pop();
  }

  async getBarcodesByPaquete(paqueteId: number): Promise<string[]> {
    const barcodes = await this.materialRepo
      .createQueryBuilder('material')
      .innerJoin('material.member_material', 'member_material')
      .innerJoin('member_material.member', 'member')
      .where('member.paquete_id = :paqueteId', { paqueteId })
      .select('material.barcode')
      .getRawMany();

    return barcodes.map((result) => result.material_barcode);
  }
}
