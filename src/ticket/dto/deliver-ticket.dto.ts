import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ddDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  delivered: number;
}
export class DeliveredTicketDto {
  @IsString()
  @IsOptional()
  comments: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ddDto)
  loads: ddDto[];
}
