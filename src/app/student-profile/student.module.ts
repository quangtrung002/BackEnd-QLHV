import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { ScoreEntity } from './entities/score.entity';
import { StudentProfileEntity } from './entities/student-profile.entity';
import { TrialFeedbackEntity } from './entities/trial-feedback.entity';
import { WeeklyFeedbackEntity } from './entities/weekly-feedback.entity';
import { AdminStudentController } from './controllers/student.controller';
import { AdminStudentService } from './services/student.service';
import { UserEntity } from '../user/entities/user.entity';
import { StudentLeaveController } from './controllers/student-leave.controller';
import { StudentLeaveService } from './services/student-leave.service';
import { StudentScoreController } from './controllers/student-score.controller';
import { StudentScoreService } from './services/student-score.service';
import { StudentTrialController } from './controllers/student-trial.controller';
import { StudentTrialService } from './services/student-trial.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicYearEntity,
      EnrollmentEntity,
      LeaveRequestEntity,
      ScoreEntity,
      StudentProfileEntity,
      TrialFeedbackEntity,
      WeeklyFeedbackEntity,
      UserEntity,
    ]),
  ],
  controllers: [
    AdminStudentController,
    StudentLeaveController,
    StudentScoreController,
    StudentTrialController,
  ],
  providers: [
    AdminStudentService,
    StudentLeaveService,
    StudentScoreService,
    StudentTrialService,
  ],
  exports: [],
})
export class StudentModule {}
