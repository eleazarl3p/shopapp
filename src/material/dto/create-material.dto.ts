import { IsNumber, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsNumber()
  length: number;

  @IsString()
  guid: string;

  @IsString()
  mark: string;

  @IsString()
  piecemark: string;

  @IsString()
  material_grade: string;

  @IsString()
  material_type: string;

  @IsNumber()
  mtrl_idx: number;

  @IsString()
  remark: string;

  @IsString()
  section: string;

  @IsString()
  zone: string;

  @IsNumber()
  sub_mtrl_idx: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  width: number;

  @IsNumber()
  quantity: number;
}
