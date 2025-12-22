import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { BaseEntity } from 'src/base/entities/common.entity';

@Entity('scores')
export class ScoreEntity extends BaseEntity{
  @Column({ name: 'enrollment_id' })
  enrollmentId: number;

  @Column()
  term: string; 

  @Column({ type: 'float', nullable: true, name: 'mid_score' })
  midScore: number;

  @Column({ type: 'float', nullable: true, name: 'gita_score' })
  gitaScore: number;

  @Column({ type: 'float', nullable: true, name: 'final_score' })
  finalScore: number;

  @ManyToOne(() => EnrollmentEntity, (enrollment) => enrollment.scores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: EnrollmentEntity;
}
