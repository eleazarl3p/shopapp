import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Truck } from './entities/truck.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TruckService {
  constructor(
    @InjectRepository(Truck)
    private readonly truckRepo: Repository<Truck>,
  ) {}
  async create(createTruckDto: CreateTruckDto) {
    try {
      const truck = this.truckRepo.create(createTruckDto);
      truck.barcode = `TR-${truck.name.padStart(5, '0')}`;
      return await truck.save();
    } catch (error) {
      throw new ConflictException();
    }
  }

  async findAll() {
    return await this.truckRepo.find({ order: { barcode: 'ASC' } });
  }

  async findOne(barcode: string) {
    try {
      return await this.truckRepo.findOneOrFail({ where: { barcode } });
    } catch (error) {
      throw new NotFoundException('Truck not found');
    }
  }

  async update(_id: number, updateTruckDto: UpdateTruckDto) {
    const { name } = updateTruckDto;
    return await this.truckRepo.update(
      { _id },
      { name, barcode: `TR-${name.padStart(5, '0')}` },
    );
  }

  async remove(_id: number) {
    try {
      return await this.truckRepo.softDelete(_id);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async restore(_id: number) {
    try {
      return await this.truckRepo.restore(_id);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
