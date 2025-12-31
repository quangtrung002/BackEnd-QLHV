import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { AdminStudentService } from '../services/student.service';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import { CreateStudentDto, UpdateStudentDto } from '../dtos/student.dto';
import { ApiTagAndBearer } from 'src/base/swagger/swagger.decorator';

@ApiTagAndBearer('Quản lý học sinh')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/students')
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
}
