import { Module } from '@nestjs/common';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './entities/machine.entity';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [TypeOrmModule.forFeature([Machine]), JobModule],
  controllers: [MachineController],
  providers: [MachineService],
})
export class MachineModule {}
