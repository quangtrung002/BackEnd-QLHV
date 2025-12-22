import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/base/entities/common.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AUTH_VERSION_DIV } from '../constants/user.constants';
import { config } from 'src/configs/config.service';
import { Role } from 'src/base/authorization/role/role.enum';
import { StudentProfileEntity } from 'src/app/student-profile/entities/student-profile.entity';
import { TeacherShiftEntity } from 'src/app/teacher/entities/teacher-shift.entity';
import { TeacherAttendanceLogEntity } from 'src/app/teacher/entities/teacher-attendance-log.entity';
import { LeaveRequestEntity } from 'src/app/student-profile/entities/leave-request.entity';
import { EnrollmentEntity } from 'src/app/student-profile/entities/enrollment.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'avatar.jpg', nullable: true })
  avatarURL: string;

  @Column({ default: Role.Student })
  role: string;

  @Column({ nullable: true })
  phone: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  password: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true })
  refresh_token?: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, default: 0 })
  uav?: number;

  refreshUav(willSave: boolean = false) {
    this.uav = new Date().getTime() % AUTH_VERSION_DIV;
    willSave ? this.save() : 0;
  }

  hashPw(password: string) {
    this.password = bcrypt.hashSync(password, config.PASSWORD_SALT);
    void this.refreshUav();
  }

  comparePw(rawPw: string): boolean {
    const userPw = this.password;
    return bcrypt.compareSync(rawPw, userPw);
  }

  hashRefreshToken(refresh_token: string) {
    this.refresh_token = bcrypt.hashSync(refresh_token, config.PASSWORD_SALT);
    this.save();
  }

  campareRefreshToken(rawToken: string): boolean {
    const refreshToken = this.refresh_token;
    return bcrypt.compareSync(rawToken, refreshToken);
  }

  deleteRefreshToken() {
    this.refresh_token = null;
    void this.refreshUav(true);
  }

  @OneToOne(() => StudentProfileEntity, (studentProfile) => studentProfile.user)
  studentProfile: StudentProfileEntity;

  @OneToMany(() => TeacherShiftEntity, (shift) => shift.teacher)
  shifts: TeacherShiftEntity[];

  @OneToMany(() => TeacherAttendanceLogEntity, (log) => log.teacher)
  attendanceLogs: TeacherAttendanceLogEntity[];

  @OneToMany(() => LeaveRequestEntity, (leaveRequest) => leaveRequest.user)
  leaveRequests: LeaveRequestEntity[];

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.student)
  enrollments: EnrollmentEntity[];

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.assignedTeacher)
  assignedEnrollments: EnrollmentEntity[];
}
