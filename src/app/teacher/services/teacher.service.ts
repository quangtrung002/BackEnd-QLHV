import { UserEntity } from 'src/app/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from 'src/base/authorization/role/role.enum';
import {
  CreateAbsenceDto,
  CreateTeacherDto,
  QueryTeacherDto,
  UpdateAttendanceDto,
  UpdateTeacherDto,
} from '../dtos/teacher.dto';
import { TeacherShiftEntity } from '../entities/teacher-shift.entity';
import {
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { Status } from 'src/base/utils/status';
import { User } from 'src/auth/interfaces/user.class';
import { LeaveRequestEntity } from 'src/app/student-profile/entities/leave-request.entity';
import { LeaveType } from 'src/base/utils/leave-type.enum';
import { TeacherAttendanceLogEntity } from '../entities/teacher-attendance-log.entity';

export class TeacherService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
    @InjectRepository(TeacherShiftEntity)
    private readonly repoTeacherShift: Repository<TeacherShiftEntity>,
    @InjectRepository(LeaveRequestEntity)
    private readonly repoLeaveRequest: Repository<LeaveRequestEntity>,
    @InjectRepository(TeacherAttendanceLogEntity)
    private readonly repoAttendanceLog: Repository<TeacherAttendanceLogEntity>,
  ) {}

  async getListTeacherDropList() {
    return await this.repoUser.find({
      where: { role: 'Teacher', status: Status.ACTIVE },
      select: ['username', 'id'],
    });
  }

  async getListTeacher(user: User, params: QueryTeacherDto) {
    const { month, year } = params.filter;
    const teachers = await this.repoUser.find({
      where: { role: 'Teacher', status: Status.ACTIVE },
      relations: ['shifts'],
    });
    const leaveRequest = await this.repoLeaveRequest
      .createQueryBuilder('lq')
      .leftJoinAndSelect('lq.user', 'teacher')
      .where('EXTRACT(MONTH FROM lq.date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM lq.date) = :year', { year })
      .andWhere('lq.type = :type', { type: LeaveType.TEACHER_ABSENCE })
      .andWhere('lq.status = :status', { status: Status.ACTIVE })
      .getMany();

    const schedules = await this.repoAttendanceLog
      .createQueryBuilder('atl')
      .leftJoinAndSelect('atl.teacher', 'teacher')
      .where('atl.month = :month', { month })
      .andWhere('atl.year = :year', { year })
      .andWhere('atl.status = :status', { status: Status.ACTIVE })
      .getMany();

    return {
      teachers: teachers.map((u) => {
        return {
          id: u.id,
          username: u.username,
          phone: u.phone,
          email: u.email,
          shifts: u.shifts[0].shifts,
        };
      }),
      leaves: leaveRequest.map((leave) => {
        return {
          leaveId: leave.id,
          teacherName: leave.user.username,
          teacherId: leave.userId,
          date: leave.date,
          reason: leave.reason,
        };
      }),
      schedules: schedules.map((schedule) => {
        return {
          teacherId: schedule.teacher.id,
          teacherName: schedule.teacher.username,
          month: schedule.month,
          year: schedule.year,
          shiftName: schedule.shiftName,
          days: schedule.days,
        };
      }),
    };
  }

  async createTeacher(user: User, dto: CreateTeacherDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { username, email, phone, shifts } = dto;

      const isExist = await queryRunner.manager.findOne(UserEntity, {
        where: { email },
      });

      if (isExist) {
        throw new ConflictException('Email đã tồn tại!');
      }

      const newTeacher = queryRunner.manager.create(UserEntity, {
        username,
        email,
        phone,
        password: 'Gita@6789',
        role: Role.Teacher,
        status: Status.ACTIVE,
      });

      newTeacher.hashPw(newTeacher.password);

      const savedTeacher = await queryRunner.manager.save(newTeacher);

      const teacherShift = queryRunner.manager.create(TeacherShiftEntity, {
        teacherId: savedTeacher.id,
        shifts,
      });

      await queryRunner.manager.save(teacherShift);

      await queryRunner.commitTransaction();

      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTeacher(user: User, id: number, dto: UpdateTeacherDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldRecord = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
      });

      if (!oldRecord) {
        throw new NotFoundException('Không tìm thấy thông tin người dùng!');
      }

      const { shifts, email, ...dtoUser } = dto;

      queryRunner.manager.merge(UserEntity, oldRecord, {
        ...dtoUser,
        updatedById: user.id,
      });
      await queryRunner.manager.save(oldRecord);

      if (shifts !== undefined) {
        let oldShift = await queryRunner.manager.findOne(TeacherShiftEntity, {
          where: { teacherId: oldRecord.id },
        });

        if (!oldShift) {
          oldShift = queryRunner.manager.create(TeacherShiftEntity, {
            teacherId: oldRecord.id,
            shifts,
            updatedById: user.id,
          });
        } else {
          oldShift.shifts = shifts;
          oldShift.updatedById = user.id;
        }

        await queryRunner.manager.save(oldShift);
      }

      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createAbsence(user: User, dto: CreateAbsenceDto) {
    const teacher = await this.repoUser.findOne({
      where: { id: dto.teacherId },
    });
    if (!teacher) throw new NotFoundException('Không tìm thấy ID người dùng!');
    const absence = await this.repoLeaveRequest.create({
      ...dto,
      type: LeaveType.TEACHER_ABSENCE,
      createdById: user.id,
      userId: dto.teacherId,
    });
    await this.repoLeaveRequest.save(absence);
    return;
  }

  async deleteAbsence(user: User, id: number) {
    const absence = await this.repoLeaveRequest.findOne({ where: { id } });
    if (!absence)
      throw new NotFoundException('Dữ liệu ngày nghỉ không hợp lệ!');
    this.repoLeaveRequest.merge(absence, {
      deletedById: user.id,
      status: Status.DELETED,
    });
    this.repoLeaveRequest.save(absence);
    return;
  }

  async deleteTeacher(user: User, id: number) {
    const teacher = await this.repoUser.findOne({ where: { id } });
    if (!teacher)
      throw new NotFoundException('Dữ liệu giáo viên không hợp lệ!');
    this.repoUser.merge(teacher, {
      deletedById: user.id,

      status: Status.DELETED,
    });
    this.repoUser.save(teacher);
    const shift = await this.repoTeacherShift.findOne({
      where: { teacherId: teacher.id },
    });
    if (!shift) return;
    else {
      this.repoTeacherShift.merge(shift, {
        deletedById: user.id,

        status: Status.DELETED,
      });
      this.repoTeacherShift.save(shift);
    }

    return;
  }

  async updateAttendance(user: User, dto: UpdateAttendanceDto) {
    const { teacherId, month, year, shiftName, days } = dto;
    return await this.dataSource.transaction(async (manager) => {
      const teacher = await manager.findOne(UserEntity, {
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Không tìm thấy giáo viên!');
      }

      let teacherAttendance = await manager.findOne(
        TeacherAttendanceLogEntity,
        {
          where: {
            teacherId,
            month,
            year,
            shiftName,
          },
        },
      );

      if (!teacherAttendance) {
        const newShift = manager.create(TeacherAttendanceLogEntity, {
          teacherId,
          month,
          year,
          shiftName,
          days: days ?? [],
          createdById: user.id,
        });

        return await manager.save(newShift);
      }

      if (days && days.length > 0) {
        const currentDays = teacherAttendance.days ?? [];

        const updatedDays = [...currentDays];

        for (const day of days) {
          const index = updatedDays.indexOf(day);

          if (index !== -1) {
            updatedDays.splice(index, 1);
          } else {
            updatedDays.push(day);
          }
        }

        teacherAttendance.days = updatedDays.sort((a, b) => a - b);
      }

      await manager.save(teacherAttendance);
      return;
    });
  }
}
