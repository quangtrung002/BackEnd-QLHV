import { UserEntity } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/base/entities/common.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('teacher_attendance_logs')
@Unique(['teacherId', 'date', 'shiftName'])
export class TeacherAttendanceLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'shift_name' })
  shiftName: string;

  @Column({ name: 'is_present', default: true })
  isPresent: boolean;

  @ManyToOne(() => UserEntity, (user) => user.attendanceLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;
}
