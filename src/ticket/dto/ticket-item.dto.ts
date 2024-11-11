import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { UpdateTeamDto } from 'src/team/dto/update-team.dto';

export class TicketItemDto {
  @IsNumber()
  member_id: number;

  @IsNotEmpty()
  @IsString()
  piecemark: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  loaded: number;

  @IsOptional()
  @IsNumber()
  delivered: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTeamDto)
  team: UpdateTeamDto;
}

export class OtherItemDto {
  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
