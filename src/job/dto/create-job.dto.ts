import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { CreateContactDto } from 'src/contact/dto/create-contact.dto';
import { AddressDto } from 'src/otherDtos/address.dto';

export class CreateJobDto {
  @IsString()
  job_name: string;

  @IsString()
  barcode: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  url_3d: string;

  @ValidateNested()
  @Type(() => CreateContactDto)
  installer: CreateContactDto;

  @ValidateNested()
  @Type(() => CreateContactDto)
  gc: CreateContactDto;
}
