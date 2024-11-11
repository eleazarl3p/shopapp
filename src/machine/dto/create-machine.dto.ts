import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

import { UpdateShapeDto } from 'src/shape/dto/update-shape.dto';

export class CreateMachineDto {
  @IsString()
  name: string;

  @IsNumber()
  rank: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateShapeDto)
  shapes: UpdateShapeDto[];
}
