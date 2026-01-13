import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AdminStudentService } from '../services/student.service';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  CreateStudentDto,
  QueryStudentDto,
  UpdateStudentDto,
} from '../dtos/student.dto';
import { ApiTagAndBearer } from 'src/base/swagger/swagger.decorator';
import { ApiOperation } from '@nestjs/swagger';

@ApiTagAndBearer('Quản lý học sinh')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/students')
export class AdminStudentController {
  constructor(private readonly adminStudentService: AdminStudentService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả học sinh năm học hiện tại ' })
  async findAll(@UserAuth() user: User, @Query() query: QueryStudentDto) {
    return this.adminStudentService.getAllStudent(user, query);
  }

  @Get(':enrollmentId')
  @ApiOperation({ summary: 'Lấy thông tin học sinh theo id' })
  async getStudentById(
    @UserAuth() user: User,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.adminStudentService.getStudentById(user, enrollmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo học sinh mới' })
  async create(@UserAuth() user: User, @Body() dto: CreateStudentDto) {
    return await this.adminStudentService.createStudent(user, dto);
  }

  @Put(':enrollmentId')
  @ApiOperation({ summary: 'Cập nhật thông tin học sinh' })
  async update(
    @UserAuth() user: User,
    @Body() dto: UpdateStudentDto,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return await this.adminStudentService.updateStudent(
      user,
      dto,
      enrollmentId,
    );
  }

  @Delete(':enrollmentId')
  @ApiOperation({ summary: 'Xóa học viên' })
  async delete(
    @UserAuth() user: User,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.adminStudentService.deleteStudent(user, enrollmentId);
  }
  ß;
}
