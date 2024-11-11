import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class ldDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  loaded: number;

  @IsNumber()
  delivered: number;
}

export class TCommentDto {
  @IsString()
  details: string;
}
export class LoadTicketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TCommentDto)
  tcomments: TCommentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ldDto)
  items: ldDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ldDto)
  other_items: ldDto[];
}
