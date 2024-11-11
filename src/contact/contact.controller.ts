import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  find(@Query('id') id: number, @Query('firstname') firstname: string) {
    if (id != undefined) {
      return this.contactService.findOne(id);
    }

    if (firstname != undefined) {
      return this.contactService.findOneByPhone(firstname);
    }

    return this.contactService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }

  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.restore(id);
  }
}
