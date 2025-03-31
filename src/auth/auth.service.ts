import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
//import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
//import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    let user: User = null;
    if (username.length == 0) {
      user = await this.userService.findOneByEmail(email);
    } else {
      user = await this.userService.findOneByUsername(username);
    }

    if (!user) return null;

    //const passwordValid = await bcrypt.compare(password, user.password);

    if (user.password == password) return user;

    return null;
  }

  async login({ username, email, password }: LoginDto) {
    const user: User = await this.validateUser(username, email, password);

    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    const payload = {
      username: user.username,
      email: user.email,
      sub: user._id,
    };
    user.password = '';
    const token = await this.jwtService.signAsync(payload);
    user['token'] = token;

    return user;
  }
}
