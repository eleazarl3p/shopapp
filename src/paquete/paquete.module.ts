import { Module } from '@nestjs/common';
import { PaqueteService } from './paquete.service';
import { PaqueteController } from './paquete.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paquete } from './entities/paquete.entity';
import { MemberModule } from 'src/member/member.module';
import { JobModule } from 'src/job/job.module';
import { MaterialModule } from 'src/material/material.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paquete]),
    JobModule,
    MemberModule,
    MaterialModule,
  ],
  controllers: [PaqueteController],
  providers: [PaqueteService],
})
export class PaqueteModule {}
