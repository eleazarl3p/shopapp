import { IsString } from 'class-validator';

export class CreateShapeDto {
  @IsString()
  name: string;
}
