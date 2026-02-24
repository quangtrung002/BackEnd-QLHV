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
import { ApiTagAndBearer } from 'src/base/swagger/swagger.decorator';
import { TeacherService } from '../services/teacher.service';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  CreateAbsenceDto,
  CreateTeacherDto,
  QueryTeacherDto,
  UpdateAttendanceDto,
  UpdateTeacherDto,
} from '../dtos/teacher.dto';

@ApiTagAndBearer('Lấy danh sách giáo viên')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/teachers')
export class TeacherController {
  constructor(private readonly teacherServie: TeacherService) {}

  @Get()
  getListTeacherDropList() {
    return this.teacherServie.getListTeacherDropList();
  }

  @Get('list')
  getListTeacher(@UserAuth() user: User, @Query() query: QueryTeacherDto) {
    return this.teacherServie.getListTeacher(user, query);
  }

  @Post()
  createTeacher(@UserAuth() user: User, @Body() dto: CreateTeacherDto) {
    return this.teacherServie.createTeacher(user, dto);
  }
  @Put('attendance')
  updateAttendance(@UserAuth() user: User, @Body() dto: UpdateAttendanceDto) {
    return this.teacherServie.updateAttendance(user, dto);
  }

  @Put(':id')
  updateTeacher(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teacherServie.updateTeacher(user, id, dto);
  }

  @Post('absence')
  createAbsence(@UserAuth() user: User, @Body() dto: CreateAbsenceDto) {
    return this.teacherServie.createAbsence(user, dto);
  }

  @Delete('absence/:id')
  deleteAbsence(@UserAuth() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.teacherServie.deleteAbsence(user, id);
  }

  @Delete(':id')
  deleteTeacherr(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teacherServie.deleteTeacher(user, id);
  }
}
