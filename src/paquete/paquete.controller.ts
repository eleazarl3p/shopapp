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
import { PaqueteService } from './paquete.service';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import { UpdatePaqueteDto } from './dto/update-paquete.dto';

@Controller('paquetes')
export class PaqueteController {
  constructor(private readonly paqueteService: PaqueteService) {}

  @Post(':id')
  create(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPaqueteDto: CreatePaqueteDto,
  ) {
    return this.paqueteService.create(id, createPaqueteDto);
  }

  @Get()
  findAll() {
    return this.paqueteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paqueteService.getBarcode(id); //this.paqueteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaqueteDto: UpdatePaqueteDto) {
    return this.paqueteService.update(+id, updatePaqueteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paqueteService.remove(id);
  }
}
