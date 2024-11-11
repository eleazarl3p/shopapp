import { PartialType } from '@nestjs/swagger';
import { CreateShapeDto } from './create-shape.dto';
import { IsNumber } from 'class-validator';

export class UpdateShapeDto extends PartialType(CreateShapeDto) {
  @IsNumber()
  _id: number;
}
