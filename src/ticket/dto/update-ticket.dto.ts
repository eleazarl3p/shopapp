import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsArray, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
