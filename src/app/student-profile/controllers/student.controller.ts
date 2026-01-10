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
  CreateFeedbackTrialDto,
  CreateLeaveRequestDto,
  CreateStudentDto,
  FilterScoreStudentDto,
  QueryLeaveRequestDto,
  QueryStudentDto,
  QueryStudentTrialDto,
  UpdateScoreStudentDto,
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
  async findAll(@UserAuth() user, @Query() query: QueryStudentDto) {
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
    return await this.adminStudentService.updateStudent(user, dto, enrollmentId);
  }

  @Delete(":enrollmentId")
  @ApiOperation({summary : "Xóa học viên"})
  async delete(@UserAuth() user : User, @Param("enrollmentId", ParseIntPipe) enrollmentId : number){
    return this.adminStudentService.deleteStudent(user, enrollmentId)
  }

  @Get('/scores')
  @ApiOperation({ summary: 'Lấy danh sách điểm học sinh theo kỳ và lớp' })
  async getListStudent(
    @UserAuth() user: User,
    @Query() filter: FilterScoreStudentDto,
  ) {
    const { term, grade } = filter;
    return await this.adminStudentService.getListStudentScore(term, grade);
  }

  @Put('/scores/:id')
  @ApiOperation({ summary: 'Cập nhật điểm học sinh' })
  async updateScore(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() scores: UpdateScoreStudentDto,
  ) {
    return await this.adminStudentService.updateStudentScores(user, id, scores);
  }

  @Get('/leave-requests')
  @ApiOperation({ summary: 'Lấy danh sách đơn xin nghỉ học của học sinh' })
  async getLeaveRequests(
    @UserAuth() user: User,
    @Query() query: QueryLeaveRequestDto,
  ) {
    return await this.adminStudentService.getLeaveRequests(user, query);
  }

  @Get('/list')
  @ApiOperation({ summary: 'Lấy danh sách học sinh để đổ droplist' })
  async getListStudents(@UserAuth() user: User) {
    return await this.adminStudentService.getListStudents(user);
  }

  @Post('leave-requests')
  @ApiOperation({ summary: 'Tạo đơn xin nghỉ học cho học sinh' })
  async createLeaveRequest(
    @UserAuth() user: User,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return await this.adminStudentService.createLeaveRequest(user, dto);
  }

  @Delete('leave-requests/:id')
  @ApiOperation({ summary: 'Xóa đơn xin nghỉ học của học sinh' })
  async deleteLeaveRequest(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.adminStudentService.deleteLeaveRequest(user, id);
  }

  @Get('list-trial')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh học trải nghiệm và nhận xét của giáo viên',
  })
  async getListStudentTrial(
    @UserAuth() user: User,
    @Query() query: QueryStudentTrialDto,
  ) {
    return await this.adminStudentService.getListStudentTrial(user, query);
  }

  @Post('trial-feedback')
  @ApiOperation({ summary: 'Tạo nhận xét học sinh học trải nghiệm' })
  async createTrialFeedback(
    @UserAuth() user: User,
    @Body() body: CreateFeedbackTrialDto,
  ) {
    return await this.adminStudentService.createFeedbackTrial(user, body);
  }

  @Put('trial-student/:enrollmentId')
  @ApiOperation({ summary: 'Chuyển học viên trải nghiệm sang chính thức ' })
  async updateTrialStudent(
    @UserAuth() user: User,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return await this.adminStudentService.updateTrialStudent(
      user,
      enrollmentId,
    );
  }
}
