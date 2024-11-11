import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TaskDto } from './create-task.dto';

@Injectable()
export class CustomTaskValitationPipe implements PipeTransform {
  async transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Expected an array');
    }

    const tasks = value.map((item) => plainToInstance(TaskDto, item));

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
