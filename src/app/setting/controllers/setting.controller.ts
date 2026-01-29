import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { CreateManager, PermissionDto, SettingDto } from '../dtos/setting.dto';
import { RoleGroup } from 'src/base/authorization/role/role.enum';
import { Roles } from 'src/base/authorization/role/role.decorator';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';

@ApiTagAndBearer('Cài đặt chung hệ thống')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingService) {}

  @Get()
  @ApiOperation({ summary: 'Tất cả các setting' })
  async index() {
    return this.settingsService.getAll();
  }

  // @Get(':settingKey')
  // @ApiOperation({ summary: 'Lấy chi tiết một key' })
  // async view(@Param('settingKey') key: string) {
  //   return this.settingsService.load(key);
  // }

  @Roles(RoleGroup.Admins)
  @Put()
  @ApiOperation({ summary: 'Chỉnh sửa setting' })
  async update(@Body() body: SettingDto) {
    return this.settingsService.createOrUpdate(body);
  }

  @Get('permission')
  @ApiOperation({ summary: 'Lấy tất cả người dùng có quyền hạn' })
  async getPermission() {
    return this.settingsService.getPermission();
  }

  @Put('permission')
  @ApiOperation({ summary: 'Phân quyền' })
  async updatePermission(@UserAuth() user: User, @Body() body: PermissionDto) {
    return this.settingsService.updatePermission(user, body);
  }

  @Post('manager')
  @ApiOperation({ summary: 'Tạo thêm quản lý' })
  async createManager(@UserAuth() user: User, @Body() dto: CreateManager) {
    return this.settingsService.createManager(user, dto);
  }
}
