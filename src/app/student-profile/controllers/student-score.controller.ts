import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  ApiOperation,
  ApiTagAndBearer,
} from 'src/base/swagger/swagger.decorator';
import { StudentScoreService } from '../services/student-score.service';
import { FilterScoreStudentDto, UpdateScoreStudentDto } from '../dtos/student-score.dto';

@Controller('admin/score-student')
@ApiTagAndBearer('Điểm học sinh')
@UseInterceptors(ClassSerializerInterceptor)
export class StudentScoreController {
  constructor(private readonly adminStudentScoreService : StudentScoreService)  {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách điểm học sinh theo kỳ và lớp' })
  async getListStudent(
    @UserAuth() user: User,
    @Query() filter: FilterScoreStudentDto,
  ) {
    const { term, grade } = filter;
    return await this.adminStudentScoreService.getListStudentScore(term, grade);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật điểm học sinh' })
  async updateScore(
    @UserAuth() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() scores: UpdateScoreStudentDto,
  ) {
    return await this.adminStudentScoreService.updateStudentScores(user, id, scores);
  }
}
