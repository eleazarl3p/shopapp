import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Machine } from './entities/machine.entity';
import { Repository } from 'typeorm';
import { Shape } from 'src/shape/entities/shape.entity';
import { JobService } from 'src/job/job.service';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private readonly machineRepo: Repository<Machine>,

    private readonly jobService: JobService,
  ) {}

  async create(createMachineDto: CreateMachineDto) {
    const { shapes, ...machineDto } = createMachineDto;
    try {
      const savedMachine = await this.machineRepo.save(machineDto);
      const machine = await this.machineRepo.findOne({
        where: { _id: savedMachine._id },
        relations: { shapes: true },
      });

      shapes.forEach((sh) => {
        machine.shapes.push({ _id: sh._id } as Shape);
      });
      return await machine.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    const machines = await this.machineRepo.find({
      // relations: {
      //   tasks_items: { task: { member: { paquete: true } } },
      // },
      // order: {
      //   tasks_items: { task: { member: { paquete: { name: 'ASC' } } } },
      // },
    });

    return machines;
    // return machines.map((machine) => {
    //   const paquetes = {};
    //   machine.tasks_items.forEach((ti) => {
    //     paquetes[ti.task.member.paquete._id] = ti.task.member.paquete.name;
    //   });

    //   return {
    //     _id: machine._id,
    //     image: machine.image,
    //     name: machine.name,
    //     paquetes,
    //     shapes: machine.shapes,
    //   };
    // });
  }

  async update(_id: number, updateMachineDto: UpdateMachineDto) {
    const { shapes, name, rank } = updateMachineDto;

    const machine = await this.machineRepo.findOne({ where: { _id } });

    machine.shapes = [];
    shapes.forEach((sh) => {
      machine.shapes.push({ _id: sh._id } as Shape);
    });

    machine.name = name;
    machine.rank = rank;

    return await machine.save();
  }

  async remove(_id: number) {
    return await this.machineRepo.delete(_id);
  }
}
