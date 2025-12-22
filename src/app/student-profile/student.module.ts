import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { ScoreEntity } from './entities/score.entity';
import { StudentProfileEntity } from './entities/student-profile.entity';
import { TrialFeedbackEntity } from './entities/trial-feedback.entity';
import { WeeklyFeedbackEntity } from './entities/weekly-feedback.entity';

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
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class StudentModule {}
