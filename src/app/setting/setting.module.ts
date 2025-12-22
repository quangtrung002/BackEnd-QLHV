import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import { SettingsController } from './controllers/setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity])],
  providers: [SettingService],
  controllers : [SettingsController]
})
export class SettingsModule {}
