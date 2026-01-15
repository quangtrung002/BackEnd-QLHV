import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { BaseEntity } from 'src/base/entities/common.entity';

@Entity('weekly_feedbacks')
export class WeeklyFeedbackEntity extends BaseEntity {
  @Column({ name: 'enrollment_id' })
  enrollmentId: number;

  @Column()
  week: number;

  @Column({ type: 'text', nullable: true })
  content: string;

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
