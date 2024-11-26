import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CustomTaskValitationPipe } from './dto/validate-task.pipe';
import { CutItemDto } from './dto/cut-task-item.dto';
import { AuthGuard } from '@nestjs/passport';
import { TaskToAreaDto } from './dto/task-to-area.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';

@Controller('task')
@UseGuards(AuthGuard('jwt'))
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body(new CustomTaskValitationPipe()) tasks: TaskDto[]) {
    return this.taskService.create(tasks);
  }

  @Post('area/to-qc/')
  async moveToArea(@Body() taskToAreaDto: TaskToAreaDto[], @Req() req: any) {
    const userId = req.user.sub;
    return await this.taskService.moveToArea(taskToAreaDto, userId);
  }

  @Get('area/pending-tasks/:area/:paquete')
  pendingTaskArea(
    @Param('area', ParseIntPipe) areaId: number,
    @Param('paquete', ParseIntPipe) paqueteId: number,
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    return this.taskService.pendingTaskArea(areaId, paqueteId, all);
  }

  @Post('machine/cut-materials')
  async cutTaskItems(@Body() cutItemDto: CutItemDto[], @Req() req: any) {
    const userId = req.user.sub;
    return await this.taskService.cutTaskItems(cutItemDto, userId);
  }

  @Get('machine/pending-tasks/:machine/:paquete')
  pendingTaskMachine(
    @Param('machine', ParseIntPipe) machineId: number,
    @Param('paquete', ParseIntPipe) paqueteId: number,
    @Query('all', ParseBoolPipe) all: boolean,
  ) {
    return this.taskService.pendingTaskMachine(machineId, paqueteId, all);
  }

  @Get('job/pending-paquetes-tasks/:machine_id/:job_id')
  async jobMachineTask(
    @Param('machine_id', ParseIntPipe) machine_id: number,
    @Param('job_id', ParseIntPipe) job_id: number,
  ) {
    return await this.taskService.jobMachineTask(machine_id, job_id);
  }

  @Get('failed-tasks/:paquete')
  async failedTasks(@Param('paquete', ParseIntPipe) paquete_id: number) {
    return await this.taskService.qcFailedMembers(paquete_id);
  }

  // @Get('fully-cut-tasks/:paquete')
  // async fullyCutTasks(@Param('paquete', ParseIntPipe) paqueteId: number) {
  //   return await this.taskService.fullyCutTasks(paqueteId);
  // }

  // @Get('get-tasks-area/:area/:paquete')
  // async getTaskArea(
  //   @Param('area', ParseIntPipe) areaId: number,
  //   @Param('paquete', ParseIntPipe) paqueteId: number,
  //   @Query('completed') completed: string,
  // ) {
  //   return await this.taskService.getTaskArea(areaId, paqueteId, completed);
  // }

  @Patch('expected/date/update')
  async update(@Body() updateTaskDto: UpdateTaskDto[]) {
    return await this.taskService.update(updateTaskDto);
  }

  @Delete('delete')
  async remove(@Body() deleteTaskDto: DeleteTaskDto[]) {
    return await this.taskService.remove(deleteTaskDto);
  }
}
