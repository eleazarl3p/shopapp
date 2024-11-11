import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AuthorizedApps, UserRole } from '../entities/user.entity';

const allowedApps = [AuthorizedApps.MOBILE, AuthorizedApps.DESKTOP];
const allowedRoles = [UserRole.ADMIN, UserRole.EDITOR, UserRole.NOTASSIGNED];

export class CreateUserDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: '' })
  @IsString()
  middle_name?: string;

  @ApiProperty({ example: 'Pepe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'name@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @MinLength(5)
  password: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsOptional()
  level: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  team: number;

  @ApiProperty({ example: 'editor' })
  @IsString()
  @IsIn(allowedRoles)
  role: UserRole;

  @ApiProperty({ example: ['Desktop', 'Mobile'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsIn(allowedApps, { each: true })
  authorized_apps: string[];
}
