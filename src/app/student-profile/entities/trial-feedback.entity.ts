import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { BaseEntity } from 'src/base/entities/common.entity';

@Entity('trial_feedbacks')
export class TrialFeedbackEntity extends BaseEntity {
  @Column({ name: 'enrollment_id' })
  enrollmentId: number;

  @Column({ name: 'session_number' })
  sessionNumber: number; // 1, 2, 3, 4

  @Column({ name: 'learning_date', type: 'date' })
  learningDate: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(
    () => EnrollmentEntity,
    (enrollment) => enrollment.trialFeedbacks,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: EnrollmentEntity;
}
