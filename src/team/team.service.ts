import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}
  async create(createTeamDto: CreateTeamDto) {
    try {
      return await this.teamRepo.save(createTeamDto);
    } catch (error) {
      throw new ConflictException('Duplicate team name is not alloewd');
    }
  }

  async findAll() {
    return await this.teamRepo.find({ order: { name: 'ASC' } });
  }

  async assignedPaquete(_id: number) {
    const team = await this.teamRepo.findOne({
      where: { _id },
      relations: {
        tasks: {
          items: true,
          member: { paquete: true },
        },
      },
      order: {
        tasks: { estimated_date: 'ASC', member: { paquete: { name: 'ASC' } } },
      },
    });

    if (!team) {
      throw new NotFoundException();
    }

    const paquetes = {};
    team.tasks.forEach((task) => {
      task.items.forEach((it) => {
        //if (it.assigned > it.cut) {
        paquetes[task.member.paquete._id] = task.member.paquete.name;
        //}
      });
    });

    return paquetes;
  }

  async findOne(_id: number, paquete_id: number) {
    const team = await this.teamRepo.findOne({
      where: { _id, tasks: { member: { paquete: { _id: paquete_id } } } },
      relations: {
        tasks: {
          member: { paquete: true },
          items: { machine: true, material: true, cut_history: true },
        },
      },
      order: { tasks: { estimated_date: 'ASC' } },
    });

    if (!team) {
      throw new NotFoundException();
    }

    return {
      name: team.name,
      tasks: team.tasks.map((task) => {
        return {
          _id: task._id,
          quantity: 1, //task.quantity,
          expected_date: task.expected_date,
          piecemark: task.member.piecemark,
          desc: `${task.member.mem_desc} ${task.member.main_material}`,
          items: task.items.map((itm) => {
            return {
              //_id: itm._id,
              assigned: itm.assigned,
              cut: itm.cut_history.reduce(
                (acc, cut) => (acc += cut.approved),
                0,
              ),
              mark: itm.material.piecemark,
              section: itm.material.section,
              machine: itm.machine.name,
            };
          }),
        };
      }),
    };
  }

  async update(_id: number, updateTeamDto: UpdateTeamDto) {
    try {
      return this.teamRepo.update({ _id }, { ...updateTeamDto });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async remove(id: number) {
    try {
      return await this.teamRepo.softDelete(id);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
