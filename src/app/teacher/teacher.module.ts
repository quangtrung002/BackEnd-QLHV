import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherController } from './controllers/teacher.controller';
import { TeacherService } from './services/teacher.service';
import { UserEntity } from '../user/entities/user.entity';
import { TeacherShiftEntity } from './entities/teacher-shift.entity';
import { LeaveRequestEntity } from '../student-profile/entities/leave-request.entity';
import { TeacherAttendanceLogEntity } from './entities/teacher-attendance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TeacherShiftEntity,
      LeaveRequestEntity,
      TeacherAttendanceLogEntity,
    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [],
})
export class TeacherModule {}
