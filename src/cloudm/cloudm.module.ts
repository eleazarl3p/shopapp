import { Module } from '@nestjs/common';
import { CloudmController } from './cloudm.controller';
import { CloudmService } from './cloudm.service';

@Module({
  controllers: [CloudmController],
  providers: [CloudmService]
})
export class CloudmModule {}
