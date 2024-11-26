import { BadRequestException, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TaskToAreaDto } from '../../task/dto/task-to-area.dto';
import { validate } from 'class-validator';

export class ValidateMemberAreaPipe implements PipeTransform {
  async transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Expected an array');
    }

    const movimientos = value.map((item) =>
      plainToInstance(TaskToAreaDto, item),
    );

    const errors = await Promise.all(
      movimientos.map(async (ma) => await validate(ma)),
    );

    if (this.errorsValidation(errors)) {
      throw new BadRequestException('Invalid data');
    }

    return movimientos;
  }

  private errorsValidation(errors: any[]) {
    const errorL = errors
      .map((error, index) => (error.length ? { index, errors: error } : null))
      .filter(Boolean);

    return errorL.length;
  }
}
