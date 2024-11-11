import { Module } from '@nestjs/common';
import { TruckService } from './truck.service';
import { TruckController } from './truck.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Truck } from './entities/truck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Truck])],
  controllers: [TruckController],
  providers: [TruckService],
})
export class TruckModule {}
