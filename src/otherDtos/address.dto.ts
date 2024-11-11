import { IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  zip: string;

  @IsString()
  state: string;
}
