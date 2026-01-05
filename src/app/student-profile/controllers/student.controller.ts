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
import { AdminStudentService } from '../services/student.service';
import { SkipAuth, UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import {
  CreateStudentDto,
  FilterScoreStudentDto,
  UpdateScoreStudentDto,
  UpdateStudentDto,
} from '../dtos/student.dto';
import { ApiTagAndBearer } from 'src/base/swagger/swagger.decorator';
import { ApiQuery } from '@nestjs/swagger';

@ApiTagAndBearer('Quản lý học sinh')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/students')
@SkipAuth()
export class AdminStudentController {
  constructor(private readonly adminStudentService: AdminStudentService) {}
  @Post()
  async create(@UserAuth() user: User, @Body() dto: CreateStudentDto) {
    return await this.adminStudentService.createStudent(user, dto);
  }

  @Put(':id')
  async update(
    @UserAuth() user: User,
    @Body() dto: UpdateStudentDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.adminStudentService.updateStudent(user, dto, id);
  }

  @Get('/scores')
  async getListStudent(@Query() filter: FilterScoreStudentDto) {
    const { term, grade } = filter;
    return await this.adminStudentService.getListStudentScore(term, grade);
  }

  @Put('/scores/:id')
  async updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() scores: UpdateScoreStudentDto,
  ) {
    return await this.adminStudentService.updateStudentScores(id, scores);
  }
}
