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

    return m.map((obj) => {
      const result = Object.values(obj)[0];

      //return result;
      const reducedData = Object.values(
        result.cut_history.reduce(
          (acc, item) => {
            // Normalize created_at to a date string (e.g., "YYYY-MM-DD")
            const createdAtDate = new Date(item.created_at);
            // .toISOString()
            // .split('T');

            const key = `${createdAtDate}`;
            if (!acc[key]) {
              acc[key] = {
                _id: item._id,
                quantity: 0,
                approved: 0,
                comments: '',
                review_date: item.review_date,
                created_at: item.created_at,
                user: item.user,
                inspection_link: [],
                machine: item.machine,
              };
            }

            // Aggregate values
            acc[key].quantity += item.quantity;
            acc[key].approved += item.approved ? item.approved : 0;
            if (item.inspection_link.length > 5) {
              acc[key].inspection_link.push(item.inspection_link);
            }
            return acc;
          },
          {} as Record<string, any>,
        ),
      );

      // Sort by created_date (ascending)
      reducedData.sort(
        (a, b) =>
          new Date(a['created_date']).getTime() -
          new Date(b['created_date']).getTime(),
      );

      return {
        ...result,
        cut_history: reducedData,
      };
    });
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
