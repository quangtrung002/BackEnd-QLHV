import {
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
  Post,
  Patch,
} from '@nestjs/common';
import {
  ApiDeleteOperation,
  ApiListOperation,
  ApiOperation,
  ApiPaginatedResponse,
  ApiPartialOperation,
  ApiResponses,
  ApiRetrieveOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { AdminLockUserDto, AdminQueryUserDto } from '../dtos/admin-user.dto';
import { AdminUserService } from '../services/admin-user.service';
import { UserEntity } from '../entities/user.entity';
import { Roles } from 'src/base/authorization/role/role.decorator';
import { RoleGroup } from 'src/base/authorization/role/role.enum';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import { SetPasswordDto } from '../dtos/user.dto';
import { In } from 'typeorm';
import { IdsDto } from 'src/base/dtos/common.dto';
import { UserService } from '../services/user-self.service';

@ApiTagAndBearer('Admin - Tài khoản người dùng')
@UseInterceptors(ClassSerializerInterceptor)
@Roles(RoleGroup.Admins)
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiPaginatedResponse(UserEntity)
  @ApiListOperation()
  async index(
    @UserAuth() user: User,
    @Query() query: AdminQueryUserDto,
  ): Promise<any> {
    return await this.adminUserService.findAll(user, query, true);
  }

  @Get(':id')
  @ApiRetrieveOperation()
  async view(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query() query,
  ): Promise<UserEntity> {
    return await this.adminUserService.view(user, id, query);
  }

  @Put('lock')
  @ApiPartialOperation({ summary: 'Sửa nhiều bản ghi' })
  async update(@UserAuth() user: User, @Body() dto: AdminLockUserDto) {
    return await this.adminUserService.updateManyBy(
      user,
      { id: In(dto.userId) },
      { status: dto.status, createdById: user.id },
    );
  }

  @Delete('bulk-delete')
  @ApiDeleteOperation({ summary: 'Xóa nhiều bản ghi' })
  async delete(@UserAuth() user: User, @Body() dto: IdsDto) {
    return await this.userService.bulkDelete(user, dto.ids);
  }

  @Post(':id/set-password')
  @ApiOperation({ summary: 'Tạo mới mật khẩu cho tài khoản' })
  async setPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPasswordDto,
  ) {
    return await this.userService.setPassword(id, dto);
  }
}
