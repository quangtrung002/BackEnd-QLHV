import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { StudentLeaveService } from '../services/student-leave.service';
import {
  CreateLeaveRequestDto,
  QueryLeaveRequestDto,
} from '../dtos/student-leave.dto';

@Controller('admin/students/leave')
@ApiTagAndBearer('Danh sách nghỉ')
@UseInterceptors(ClassSerializerInterceptor)
export class StudentLeaveController {
  constructor(private readonly adminStudentLeaveService: StudentLeaveService) {}
  @Get('list')
  @ApiOperation({ summary: 'Lấy danh sách đơn xin nghỉ học của học sinh' })
  async getLeaveRequests(
    @UserAuth() user: User,
    @Query() query: QueryLeaveRequestDto,
  ) {
    return await this.adminStudentLeaveService.getLeaveRequests(user, query);
  }

  @Get('droplist')
  @ApiOperation({ summary: 'Lấy danh sách học sinh để đổ droplist' })
  async getListStudents(@UserAuth() user: User) {
    return await this.adminStudentLeaveService.getListStudents();
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn xin nghỉ học cho học sinh' })
  async createLeaveRequest(
    @UserAuth() user: User,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return await this.adminStudentLeaveService.createLeaveRequest(user, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn xin nghỉ học của học sinh' })
  async deleteLeaveRequest(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.adminStudentLeaveService.deleteLeaveRequest(user, id);
  }
}
