import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants/jwt.constant';
import { UserService } from '../services/user.service';
import { classToPlain } from 'class-transformer';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const { uav, email } = payload;
    const user = await this.userService.getUserActice({ email });
    
    return uav === user['uav'] ? classToPlain(user) : false;
  }
}
