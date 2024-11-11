import { IsOptional, IsString } from 'class-validator';

export class CreateSpecialUserDto {
  @IsOptional()
  _id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;
}
