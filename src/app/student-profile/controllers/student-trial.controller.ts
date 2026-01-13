import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { StudentTrialService } from '../services/student-trial.service';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  CreateFeedbackTrialDto,
  QueryStudentTrialDto,
} from '../dtos/student-trial.dto';

@Controller('admin/trial-student')
@ApiTagAndBearer('Danh sách học sinh học trải nghiệm')
@UseInterceptors(ClassSerializerInterceptor)
export class StudentTrialController {
  constructor(private readonly adminTrialStudentService: StudentTrialService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Lấy danh sách học sinh học trải nghiệm và nhận xét của giáo viên',
  })
  async getListStudentTrial(
    @UserAuth() user: User,
    @Query() query: QueryStudentTrialDto,
  ) {
    return await this.adminTrialStudentService.getListStudentTrial(user, query);
  }

  @Get(':enrollmentId/:sessionNumber')
  @ApiOperation({
    summary: 'Lấy chi tiết một feedback của học sinh trải nghiệm',
  })
  async getFeedbackTrialById(
    @UserAuth() user: User,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Param('sessionNumber', ParseIntPipe) sessionNumber: number,
  ) {
    return await this.adminTrialStudentService.getFeedbackTrialById(
      user,
      enrollmentId,
      sessionNumber
    );
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Tạo nhận xét học sinh học trải nghiệm' })
  async createTrialFeedback(
    @UserAuth() user: User,
    @Body() body: CreateFeedbackTrialDto,
  ) {
    return await this.adminTrialStudentService.createFeedbackTrial(user, body);
  }

  @Put(':enrollmentId')
  @ApiOperation({ summary: 'Chuyển học viên trải nghiệm sang chính thức ' })
  async updateTrialStudent(
    @UserAuth() user: User,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return await this.adminTrialStudentService.updateTrialStudent(
      user,
      enrollmentId,
    );
  }
}
