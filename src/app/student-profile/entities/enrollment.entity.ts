import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from 'src/base/entities/common.entity';
import { ScoreEntity } from './score.entity';
import { StudentStatus } from 'src/base/utils/student-status.enum';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { AcademicYearEntity } from './academic-year.entity';
import { WeeklyFeedbackEntity } from './weekly-feedback.entity';
import { TrialFeedbackEntity } from './trial-feedback.entity';

@Entity('enrollments')
@Unique(['studentId', 'academicYearId'])
export class EnrollmentEntity extends BaseEntity {
  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'academic_year_id' })
  academicYearId: number;

  @Column({ name: 'assigned_teacher_id', nullable: true })
  assignedTeacherId: number;

  @Column()
  grade: string;

  @Column({
    name: 'status_student',
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.OFFICIAL,
  })
  statusStudent: StudentStatus;

  @ManyToOne(() => UserEntity, (user) => user.enrollments)
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;

  @ManyToOne(() => AcademicYearEntity, (year) => year.enrollments)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYearEntity;

  @ManyToOne(() => UserEntity, (user) => user.assignedEnrollments)
  @JoinColumn({ name: 'assigned_teacher_id' })
  assignedTeacher: UserEntity;

  @OneToMany(() => ScoreEntity, (score) => score.enrollment)
  scores: ScoreEntity[];

  @OneToMany(() => WeeklyFeedbackEntity, (fb) => fb.enrollment)
  weeklyFeedbacks: WeeklyFeedbackEntity[];

  @OneToMany(() => TrialFeedbackEntity, (fb) => fb.enrollment)
  trialFeedbacks: TrialFeedbackEntity[];
}
