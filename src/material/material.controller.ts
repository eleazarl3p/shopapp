import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MaterialService } from './material.service';

@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get('all/:jobid/')
  findAll(@Param('jobid', ParseIntPipe) jobid: number) {
    return this.materialService.findAll(jobid);
  }

  @Get('one/:barcode')
  findOne(@Param('barcode') barcode: string) {
    return this.materialService.findOne(barcode);
  }
}
