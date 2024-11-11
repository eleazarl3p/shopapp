import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { OtherItemDto, TicketItemDto } from './ticket-item.dto';

const alowedTicketType = ['ERECT', 'DELIVER'];
export class CreateTicketDto {
  @IsString()
  @IsIn(alowedTicketType, { each: true })
  ticket_type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketItemDto)
  ticketItems: TicketItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherItemDto)
  otherItems: OtherItemDto[];

  @IsString()
  contact: string;
}
