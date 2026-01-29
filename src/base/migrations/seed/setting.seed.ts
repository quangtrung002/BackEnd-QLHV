import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity } from 'src/app/setting/entities/setting.entity';
import { SettingDataType } from 'src/base/utils/setting.enum';
import { Repository } from 'typeorm';

const data = [
  {
    settingKey: 'currentYear',
    settingValue: '2025-2026',
    dataType: SettingDataType.STRING,
  },
  {
    settingKey: 'shifts',
    settingValue: [
      {
        name: '18:15-19:45',
      },
      {
        name: '20:00-21:30',
      },
    ],
    dataType: SettingDataType.JSON,
  },
];

@Injectable()
export class SettingSeed {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly repoSetting: Repository<SettingEntity>,
  ) {}

  async seed() {
    const count = await this.repoSetting.count();
    if (count) return;
    return this.repoSetting.save(data);
  }
}
