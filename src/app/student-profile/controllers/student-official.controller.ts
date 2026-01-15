import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { StudentOfficialService } from '../services/student-official.service';
import { ApiTagAndBearer } from 'src/base/swagger/swagger.decorator';
import { UserAuth } from 'src/auth/decorator/jwt.decorator';
import { User } from 'src/auth/interfaces/user.class';
import { QueryOfficialStudentFeedback } from '../dtos/student-official.dto';

@Controller('admin/official-student')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTagAndBearer('Phản hồi hằng tuần của học sinh chính thức')
export class StudentOfficialController {
  constructor(
    private readonly adminStudentOfficialService: StudentOfficialService,
  ) {}

  @Get('feedback')
  getStudentTrialFeedback(@UserAuth() user : User, @Query() query : QueryOfficialStudentFeedback){
    return this.adminStudentOfficialService.getStudentTrialFeedback(user, query)
  }
}
