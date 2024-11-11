import { IsNumber } from 'class-validator';

export class TaskToAreaDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  quantity: number;
}

export class TaskAreaHistoryDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  task_id: number;

  @IsNumber()
  quantity: number;
}
