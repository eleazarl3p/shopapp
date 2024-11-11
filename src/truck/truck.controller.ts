import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TruckService } from './truck.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

@Controller('truck')
export class TruckController {
  constructor(private readonly truckService: TruckService) {}

  @Post()
  create(@Body() createTruckDto: CreateTruckDto) {
    return this.truckService.create(createTruckDto);
  }

  @Get()
  findAll() {
    return this.truckService.findAll();
  }

  @Get('barcode/:barcode')
  findOne(@Param('barcode') barcode: string) {
    return this.truckService.findOne(barcode);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTruckDto: UpdateTruckDto,
  ) {
    return this.truckService.update(id, updateTruckDto);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: number) {
    return this.truckService.restore(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.truckService.remove(id);
  }
}
