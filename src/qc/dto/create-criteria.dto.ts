import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateCriteriaDto {
  @IsOptional()
  @IsNumber()
  _id?: number;

  @IsString()
  question: string;

  @IsOptional()
  @IsNumber()
  rank?: number;
}

export class CriteriaAnswer {
  @ValidateNested()
  @Type(() => CreateCriteriaDto)
  criteria: CreateCriteriaDto;

  @IsString()
  answer: string;
}
