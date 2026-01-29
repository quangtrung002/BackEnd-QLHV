import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import { SettingsController } from './controllers/setting.controller';
import { AcademicYearEntity } from '../student-profile/entities/academic-year.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity, AcademicYearEntity, UserEntity]),
  ],
  providers: [SettingService],
  controllers: [SettingsController],
})
export class SettingsModule {}
