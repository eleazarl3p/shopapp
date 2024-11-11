import { Module } from '@nestjs/common';
import { GldriveController } from './gldrive.controller';
// import { GldriveService } from './gldrive.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [GldriveController],
  // providers: [GldriveService],
  // exports: [GldriveService],
})
export class GldriveModule {}
