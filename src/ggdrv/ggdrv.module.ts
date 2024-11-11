import { Module } from '@nestjs/common';
import { GgdrvService } from './ggdrv.service';
import { GgdrvController } from './ggdrv.controller';

@Module({
  controllers: [GgdrvController],
  providers: [GgdrvService],
})
export class GgdrvModule {}
