import { Injectable } from '@nestjs/common';
import { UserSeed } from './user.seed';
import { SettingSeed } from './setting.seed';

@Injectable()
export class SeederService {
  constructor(
    private readonly userSeed: UserSeed,
    private readonly settingSeed: SettingSeed,
  ) {}

  async seed() {
    await this.userSeed.seed();
    await this.settingSeed.seed();
  }
}
