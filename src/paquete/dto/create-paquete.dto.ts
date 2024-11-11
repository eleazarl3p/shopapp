import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

export class CreatePaqueteDto {
  @IsString()
  name: string;

  @IsString()
  url_drawings: string;

  @IsString()
  url_3d: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberDto)
  members: CreateMemberDto[];
}
