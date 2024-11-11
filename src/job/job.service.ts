import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Job } from './entites/job.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { Paquete } from 'src/paquete/entities/paquete.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}

  async findById(_id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { _id },
      relations: { paquetes: true },
      order: { paquetes: { name: 'ASC' } },
    });

    //job.paquetes = this.alphabeticalOrder(job.paquetes);
    return job;
  }

  async create(createJobDto: CreateJobDto): Promise<Job | null> {
    const md = this.jobRepo.create(createJobDto);
    try {
      return await this.jobRepo.save(md);
    } catch (error) {
      throw new ConflictException('Job name not available.');
    }
  }

  async find(job_name: string): Promise<Job> {
    return await this.jobRepo.findOneBy({ job_name });
  }

  async findAll() {
    const modelos = await this.jobRepo.find({
      relations: { paquetes: true, installer: true, gc: true },
      order: { paquetes: { name: 'asc' } },
    });
    return modelos;
  }

  async getBarcode(job_name: string): Promise<string[]> {
    try {
      const modelo = await this.jobRepo.findOneByOrFail({ job_name });
      return [modelo.barcode];
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async update(_id: number, updateModelDto: any) {
    const { installer, gc, ...job } = updateModelDto;

    return await this.jobRepo.update(
      { _id },
      {
        installer: { _id: installer == null ? null : installer._id },
        gc: { _id: gc == null ? null : gc._id },
        ...job,
      },
    );
  }

  async delete(_id: number, userId: number) {
    try {
      return await this.jobRepo.delete(_id);
    } catch (error) {}
  }

  alphabeticalOrder(paquetes: Paquete[]) {
    return paquetes.sort((a, b) => {
      const matchA = a.name.match(/^([A-Za-z]+)(\d+)?$/);
      const matchB = b.name.match(/^([A-Za-z]+)(\d+)?$/);

      const prefixA = matchA[1];
      const prefixB = matchB[1];

      const numA = matchA[2] ? parseInt(matchA[2]) : NaN;
      const numB = matchB[2] ? parseInt(matchB[2]) : NaN;

      // Compare prefixes alphabetically
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }

      // If prefixes are the same, compare numeric parts
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      // If only one has a numeric part, the non-numeric one comes first
      if (isNaN(numA) && !isNaN(numB)) {
        return -1;
      }

      if (!isNaN(numA) && isNaN(numB)) {
        return 1;
      }

      // If neither has a numeric part, they are equal in terms of sorting
      return 0;
    });
  }
}
