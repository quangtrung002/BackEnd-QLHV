import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConstants } from '../constants/jwt.constant';
import { UserService } from '../services/user.service';
import { classToPlain } from 'class-transformer';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret_refresh_token,
    });
  }

  async validate(payload: any) {
    const { uav, email } = payload;
    const user = await this.userService.getOneOrNull({ email });

    return uav === user['uav'] ? classToPlain(user) : false;
  }
}
