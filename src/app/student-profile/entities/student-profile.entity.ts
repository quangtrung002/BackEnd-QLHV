import { UserEntity } from 'src/app/user/entities/user.entity';
import { BaseEntity } from 'src/base/entities/common.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('student_profiles')
export class StudentProfileEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  grade: string;

  @Column({ type: 'text', nullable: true })
  school: string;

  @Column({ type: 'text', nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'text', nullable: true, default : "TN" })
  active : string

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'father_name', nullable: true })
  fatherName: string;

  @Column({ name: 'mother_name', nullable: true })
  motherName: string;

  @Column({ name: 'father_phone', nullable: true })
  fatherPhone: string;

  @Column({ name: 'mother_phone', nullable: true })
  motherPhone: string;

  @Column({nullable : true})
  referrer: string;

  @OneToOne(() => UserEntity, (user) => user.studentProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
