import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { contactRole } from '../entities/contact.entity';

const allowedContactType = [contactRole.GC, contactRole.INSTALLER];
export class CreateContactDto {
  @IsOptional()
  @IsNumber()
  _id: number;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsIn(allowedContactType)
  contact_role: contactRole;
}
