import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  BadRequestException,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import validator from 'validator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  find(
    @Query('email') email: string,
    @Query('username') username: string,
    @Query('barcode') barcode: string,
  ) {
    if (email != undefined) {
      if (validator.isEmail(email)) {
        return this.userService.findOneByEmail(email);
      }
      throw new BadRequestException('Email not valid');
    }

    if (username != undefined) {
      return this.userService.findOneByUsername(username);
    }

    if (barcode != undefined) {
      return this.userService.findOneByCode(barcode);
    }

    return this.userService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.userService.restore(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
