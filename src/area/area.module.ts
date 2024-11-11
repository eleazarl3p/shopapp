import { Module } from '@nestjs/common';
import { AreaService } from './area.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { AreaController } from './area.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreaModule {}
