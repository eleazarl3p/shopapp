import { IsString } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  name: string;
}
