import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { Setting, SettingDto } from '../dtos/setting.dto';
import {  RoleGroup } from 'src/base/authorization/role/role.enum';
import { Roles } from 'src/base/authorization/role/role.decorator';

@ApiTagAndBearer('Cài đặt chung hệ thống')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingService) {}

  @Get()
  @ApiOperation({ summary: 'Tất cả các setting' })
  async index(): Promise<Setting> {
    return this.settingsService.getAll();
  }

  @Get(':settingKey')
  @ApiOperation({ summary: 'Lấy chi tiết một key' })
  async view(@Param('settingKey') key: string) {
    return this.settingsService.load(key);
  }

  @Roles(RoleGroup.Admins)
  @Put()
  @ApiOperation({summary : 'Chỉnh sửa setting'})
  async update(@Body() body : SettingDto){
    return this.settingsService.createOrUpdate(body);
  }
}
