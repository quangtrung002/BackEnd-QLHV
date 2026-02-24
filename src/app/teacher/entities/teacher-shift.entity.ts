import { UserEntity } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/base/entities/common.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('teacher_shifts')
export class TeacherShiftEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  teacherId: number;

  @Column({
    name: 'shifts',
    array: true,
    type: 'text',
    default: [],
    nullable: true,
  })
  shifts: string[];

  @ManyToOne(() => UserEntity, (user) => user.shifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  teacher: UserEntity;
}
