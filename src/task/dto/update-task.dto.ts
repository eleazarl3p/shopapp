import { PartialType } from '@nestjs/swagger';
import { TaskDto } from './create-task.dto';
import { IsDate, IsNumber } from 'class-validator';

export class UpdateTaskDto extends PartialType(TaskDto) {
  @IsNumber()
  _id: number;

  @IsDate()
  expected_date: Date;
}
