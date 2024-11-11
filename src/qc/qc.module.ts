import { Module } from '@nestjs/common';
import { QcService } from './qc.service';
import { QcController } from './qc.controller';
import { TaskModule } from 'src/task/task.module';
import { JobModule } from 'src/job/job.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Criteria } from './entity/criteria.entity';
import {
  MaterialInspection,
  MemberInspection,
} from './entity/inspection.entity';
import { InspectionCriteria } from './entity/inspection-criteria.entity';
// import { GldriveModule } from 'src/gldrive/gldrive.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Criteria,
      InspectionCriteria,
      MemberInspection,
      MaterialInspection,
    ]),
    TaskModule,
    JobModule,
    // GldriveModule,
  ],
  controllers: [QcController],
  providers: [QcService],
})
export class QcModule {}
