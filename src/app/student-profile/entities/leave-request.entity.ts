import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/base/entities/common.entity';
import { LeaveType } from 'src/base/utils/leave-type.enum';
import { UserEntity } from 'src/app/user/entities/user.entity';

@Entity('leave_requests')
export class LeaveRequestEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: LeaveType })
  type: LeaveType;

  @ManyToOne(() => UserEntity, (user) => user.leaveRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
