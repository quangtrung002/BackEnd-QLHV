import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity } from '../entities/setting.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SettingDto } from '../dtos/setting.dto';
import { SettingDataType } from 'src/base/utils/setting.enum';
import * as _ from 'lodash';
import { BadRequestException } from 'src/base/exceptions/custom.exception';

const createSettingData = (value: any) => {
  let dataType = SettingDataType.STRING;

  if (_.isObject(value)) dataType = SettingDataType.JSON;
  else if (_.isNumber(value)) dataType = SettingDataType.NUMBER;
  else if (_.isBoolean(value)) dataType = SettingDataType.BOOLEAN;

  return {
    settingValue: value,
    updatedAt: new Date().toISOString(),
    dataType,
  };
};

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly repoSetting: Repository<SettingEntity>,
  ) {}

  private aliasName: string = 'settings';

  async getAll() {
    const settings = await this.repoSetting.find();
    return settings.reduce((acc, cur) => {
      acc[cur.settingKey] = cur.settingValue;
      return acc;
    }, {});
  }

  async load(settingKey: string) {
    const settingObj = await this.getAll();
    return settingObj[settingKey];
  }

  async createOrUpdate(dto: SettingDto) {
    for (const [key, value] of Object.entries(dto)) {
      if (value === undefined) continue;

      const result = await this.set(key, value);
      if (!result) {
        throw new BadRequestException(this.aliasName + ' save error');
      }
    }
  }

  async set(settingKey: string, value: any): Promise<boolean> {
    try {
      const updateDto = createSettingData(value);
      await this.repoSetting
        .createQueryBuilder(this.aliasName)
        .insert()
        .values(Object.assign({ settingKey, ...updateDto }))
        .orUpdate(['settingValue', 'dataType'], ['settingKey'])
        .execute();

      return true;
    } catch (e) {
      return false;
    }
  }
}
