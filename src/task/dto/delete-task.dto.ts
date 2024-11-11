import { IsArray, IsNumber } from 'class-validator';

export class DeleteTaskDto {
  @IsNumber()
  _id: number;
}
