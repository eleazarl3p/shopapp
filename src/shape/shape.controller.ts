import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShapeService } from './shape.service';
import { CreateShapeDto } from './dto/create-shape.dto';
import { UpdateShapeDto } from './dto/update-shape.dto';

@Controller('shapes')
export class ShapeController {
  constructor(private readonly shapeService: ShapeService) {}

  @Post()
  create(@Body() createShapeDto: CreateShapeDto) {
    return this.shapeService.create(createShapeDto);
  }

  @Get()
  findAll() {
    return this.shapeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shapeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShapeDto: UpdateShapeDto) {
    return this.shapeService.update(+id, updateShapeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shapeService.remove(+id);
  }
}
