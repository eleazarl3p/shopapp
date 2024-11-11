import { ConflictException, Injectable } from '@nestjs/common';
import { CreateShapeDto } from './dto/create-shape.dto';
import { UpdateShapeDto } from './dto/update-shape.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shape } from './entities/shape.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShapeService {
  constructor(
    @InjectRepository(Shape)
    private readonly shapeRepo: Repository<Shape>,
  ) {}

  async create(createShapeDto: CreateShapeDto) {
    try {
      return await this.shapeRepo.save(createShapeDto);
    } catch (error) {
      throw new ConflictException('Duplicate shape name is not alloewd');
    }
  }

  findAll(withRelations = false) {
    return this.shapeRepo.find({
      order: { _id: 'ASC' },
      relations: withRelations ? { machines: true } : undefined,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} shape`;
  }

  update(id: number, updateShapeDto: UpdateShapeDto) {
    return `This action updates a #${id} shape`;
  }

  remove(id: number) {
    return `This action removes a #${id} shape`;
  }
}
