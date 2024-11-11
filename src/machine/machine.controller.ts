import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

@Controller('machine')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Post()
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machineService.create(createMachineDto);
  }

  @Get()
  findAll() {
    return this.machineService.findAll();
  }

  // @Get(':machine_id/:paquete_id/tasks')
  // async pendingtasks(
  //   @Param('machine_id', ParseIntPipe) machine_id: number,
  //   @Param('paquete_id', ParseIntPipe) paquete_id: number,
  //   @Query('pending', ParseBoolPipe) pending: boolean,
  // ) {
  //   return await this.machineService.tasks(machine_id, paquete_id, pending);
  // }

  // @Get('job/pending-paquetes-tasks/:machine_id/:job_id')
  // async jobMachineTask(
  //   @Param('machine_id', ParseIntPipe) machine_id: number,
  //   @Param('job_id', ParseIntPipe) job_id: number,
  // ) {
  //   return await this.machineService.jobMachineTask(machine_id, job_id);
  // }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machineService.update(id, updateMachineDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.machineService.remove(id);
  }
}
