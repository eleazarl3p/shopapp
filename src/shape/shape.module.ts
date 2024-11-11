import { Module } from '@nestjs/common';
import { ShapeService } from './shape.service';
import { ShapeController } from './shape.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shape } from './entities/shape.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shape])],
  controllers: [ShapeController],
  providers: [ShapeService],
  exports: [ShapeService],
})
export class ShapeModule {}
