import { Injectable } from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
  ) {}
  create(createLevelDto: CreateLevelDto) {
    return 'This action adds a new level';
  }

  async findAll() {
    return this.levelRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} level`;
  }

  update(id: number, updateLevelDto: UpdateLevelDto) {
    return `This action updates a #${id} level`;
  }

  remove(id: number) {
    return `This action removes a #${id} level`;
  }
}
