import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,
  ) {}

  async findAll(): Promise<Area[]> {
    const areas = await this.areaRepo.find();
    return areas;
  }

  async findOne(_id: number): Promise<Area> {
    const area = await this.areaRepo.findOneBy({ _id });

    if (area == undefined) {
      throw new NotFoundException('Invalid area');
    }

    return area;
  }

  async findoneByCode(barcode: string): Promise<Area> {
    const area = await this.areaRepo.findOneBy({ barcode });

    if (area == undefined) {
      throw new NotFoundException('Invalid area');
    }

    return area;
  }
}
