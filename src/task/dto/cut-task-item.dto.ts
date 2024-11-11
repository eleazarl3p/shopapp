import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class CutTaskItemDto {
  @IsNumber()
  task_id: number;

  @IsNumber()
  task_assigned: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CutItemDto)
  cutDtos: CutItemDto[];
}

export class CutItemDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  quantity: number;
}
