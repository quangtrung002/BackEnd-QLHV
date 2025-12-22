import { BaseEntity } from 'src/base/entities/common.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';

@Entity('academic_years')
export class AcademicYearEntity extends BaseEntity{
  @Column()
  name: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.academicYear)
  enrollments: EnrollmentEntity[];

}