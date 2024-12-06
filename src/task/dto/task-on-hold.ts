import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { paintingType } from 'src/paint-ticket/entities/paint-ticket.entity';

export class TaskOnHoldDto {
  @IsNumber()
  _id: number;

  @IsNumber()
  task_id: number;

  //   @ValidateNested()
  //   @Type(() => CreateMemberDto)
  //   member: CreateMemberDto;
}

export class PaintTicketDto {
  @IsString()
  paint_type: paintingType;

  @IsNumber()
  truck_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOnHoldDto)
  tasks: TaskOnHoldDto[];
}

@Injectable()
export class CustomTaskOnHoldValitationPipe implements PipeTransform {
  async transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Expected an array');
    }

    const tasks = value.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Invalid item at index ${index}`);
      }
      return plainToInstance(TaskOnHoldDto, item);
    });

    const errors = await Promise.all(
      tasks.map(async (task) => await validate(task)),
    );

    if (this.errorsValidation(errors)) {
      throw new BadRequestException('Invalid data');
    }

    return tasks;
  }

  private errorsValidation(errors: any[]) {
    const errorL = errors
      .map((error, index) => (error.length ? { index, errors: error } : null))
      .filter(Boolean);

    return errorL.length;
  }
}
