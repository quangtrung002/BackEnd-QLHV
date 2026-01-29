import { InjectRepository } from '@nestjs/typeorm';
import { SettingEntity } from '../entities/setting.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  AcademyDto,
  CreateManager,
  PermissionDto,
  SettingDto,
} from '../dtos/setting.dto';
import { SettingDataType } from 'src/base/utils/setting.enum';
import * as _ from 'lodash';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { AcademicYearEntity } from 'src/app/student-profile/entities/academic-year.entity';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { Role } from 'src/base/authorization/role/role.enum';
import { User } from 'src/auth/interfaces/user.class';

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
    @InjectRepository(AcademicYearEntity)
    private readonly repoAcedemy: Repository<AcademicYearEntity>,
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
  ) {}

  private aliasName: string = 'settings';

  async getAll() {
    const settings = await this.repoSetting.find();
    const currentYear = await this.repoAcedemy.findOne({
      where: { isCurrent: true },
    });
    const setting = settings.reduce((acc, cur) => {
      acc[cur.settingKey] = cur.settingValue;
      return acc;
    }, {});
    return {
      ...setting,
      currentYear: {
        year: currentYear.name,
        startDate: currentYear.startDate,
        endDate: currentYear.endDate,
      },
    };
  }

  async load(settingKey: string) {
    const settingObj = await this.getAll();
    return settingObj[settingKey];
  }

  async createOrUpdate(dto: SettingDto) {
    const data = {
      ...dto,
      currentYear: dto.currentYear.year,
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;

      const result = await this.set(key, value);
      if (!result) {
        throw new BadRequestException(this.aliasName + ' save error');
      }
    }
    await this.updateAcademy(dto.currentYear);
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

  async updateAcademy(dto: AcademyDto) {
    try {
      const academy = await this.repoAcedemy.findOne({
        where: { name: dto.year },
      });
      if (!academy) {
        const oldRecord = await this.repoAcedemy.findOne({
          where: { isCurrent: true },
        });
        if (oldRecord) {
          oldRecord.isCurrent = false;
          await this.repoAcedemy.save(oldRecord);
        }
        await this.repoAcedemy.save({
          name: dto.year,
          startDate: dto.startDate,
          endDate: dto.endDate,
          isCurrent: true,
        });
        return true;
      }
      const oldRecord = await this.repoAcedemy.findOne({
        where: { isCurrent: true },
      });
      if (oldRecord) {
        oldRecord.isCurrent = false;
      }
      this.repoAcedemy.merge(academy, {
        startDate: dto.startDate,
        endDate: dto.endDate,
        isCurrent: true,
      });
      await this.repoAcedemy.save(oldRecord);
      await this.repoAcedemy.save(academy);

      return true;
    } catch (error) {
      return false;
    }
  }

  async getPermission() {
    const users = await this.repoUser
      .createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.role', 'u.email'])
      .where('u.role NOT IN (:...roles)', {
        roles: [Role.Teacher, Role.Student],
      })
      .getMany();
    return users;
  }

  async updatePermission(user: User, dto: PermissionDto) {
    const record = await this.repoUser.findOne({ where: { id: dto.userId } });
    if (!record) throw new NotFoundException('Không tìm thấy ID người dùng!');
    this.repoUser.merge(record, dto);
    await this.repoUser.save(record);
  }

  async createManager(user: User, dto: CreateManager) {
    const isEmail = await this.repoUser.findOne({
      where: { email: dto.email },
    });
    if (isEmail) throw new ConflictException('Email đã tồn tại!');
    const record = await this.repoUser.create({
      ...dto,
      createdById: user.id,
      password: 'Gita@6789',
    });
    record.hashPw(record.password);
    await this.repoUser.save(record);
    return;
  }
}
