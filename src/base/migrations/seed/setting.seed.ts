import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity } from 'src/app/setting/entities/setting.entity';
import { SettingDataType } from 'src/base/utils/setting.enum';
import { Repository } from 'typeorm';

const data = [
  {
    settingKey: 'mobileVersion',
    settingValue: 'v1.0.0',
    dataType: SettingDataType.STRING,
  },
  {
    settingKey: 'appContactInfo',
    settingValue: {
      phone: '111111',
      email: 'contact@gmail.com',
      address: 'Ha Noi',
      lat: '1',
      long: '1',
    },
    dataType: SettingDataType.JSON,
  },
  {
    settingKey: 'term',
    settingValue:
      'Chính sách quyền riêng tư này bao gồm thông tin chúng tôi thu thập về bạn khi bạn sử dụng các sản phẩm hoặc dịch vụ của chúng tôi hoặc tương tác với chúng tôi (ví dụ: bằng cách tham dự cơ sở hoặc sự kiện của chúng tôi hoặc bằng cách liên lạc với chúng tôi), trừ khi một chính sách khác được hiển thị.',
    dataType: SettingDataType.STRING,
  },
  {
    settingKey: 'policy',
    settingValue: 'policy',
    dataType: SettingDataType.STRING,
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
