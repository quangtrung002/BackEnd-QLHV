import { UserEntity } from 'src/app/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('teacher_shifts')
export class TeacherShiftEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  teacherId: number;

  @Column({ name: 'shift_name' })
  shiftName: string;

  @ManyToOne(() => UserEntity, (user) => user.shifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  teacher: UserEntity;
}