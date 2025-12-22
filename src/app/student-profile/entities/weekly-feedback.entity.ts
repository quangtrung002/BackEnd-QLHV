import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { BaseEntity } from 'src/base/entities/common.entity';
import { FeedbackStatus } from 'src/base/utils/feedback-status';

@Entity('weekly_feedbacks')
export class WeeklyFeedbackEntity extends BaseEntity {
  @Column({ name: 'enrollment_id' })
  enrollmentId: number;

  @Column()
  week: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    name: 'status_feedback',
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  statusFeedback: FeedbackStatus;

  @ManyToOne(
    () => EnrollmentEntity,
    (enrollment) => enrollment.weeklyFeedbacks,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: EnrollmentEntity;
}
