import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from 'src/app/setting/entities/setting.entity';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { UserSeed } from './user.seed';
import { SettingSeed } from './setting.seed';
import { SeederService } from './seeder.service';
import { AcademicYearEntity } from 'src/app/student-profile/entities/academic-year.entity';
import { AcademicYeaeService } from './academic_year.seed';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SettingEntity, AcademicYearEntity])],
  providers: [UserSeed, SettingSeed, SeederService, AcademicYeaeService],
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
