import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from 'src/app/setting/entities/setting.entity';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { UserSeed } from './user.seed';
import { SettingSeed } from './setting.seed';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SettingEntity])],
  providers: [UserSeed, SettingSeed, SeederService],
})
export class SeederModule {
  constructor(private readonly seederService: SeederService) {
    seederService
      .seed()
      .then((result) => result)
      .catch((e) => {
        throw e;
      });
  }
}
