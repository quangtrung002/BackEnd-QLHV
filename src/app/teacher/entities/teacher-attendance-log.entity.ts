import { UserEntity } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/base/entities/common.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('teacher_attendance_logs')
export class TeacherAttendanceLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ name: 'shift_name' })
  shiftName: string;

  @Column({ type: 'json', default: [] })
  days: number[];

  @ManyToOne(() => UserEntity, (user) => user.attendanceLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;
}
