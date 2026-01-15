import { InjectRepository } from '@nestjs/typeorm';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { Brackets, Repository } from 'typeorm';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { NotFoundException } from '@nestjs/common';
import { Status } from 'src/base/utils/status';
import {
  CreateLeaveRequestDto,
  QueryLeaveRequestDto,
} from '../dtos/student-leave.dto';
import { User } from 'src/auth/interfaces/user.class';
import { LeaveType } from 'src/base/utils/leave-type.enum';
import { UserEntity } from 'src/app/user/entities/user.entity';

export class StudentLeaveService {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly repoLeaveRequest: Repository<LeaveRequestEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly repoEnrollment: Repository<EnrollmentEntity>,
    @InjectRepository(AcademicYearEntity)
    private readonly repoAcademicYear: Repository<AcademicYearEntity>,
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
  ) {}

  async getListStudents() {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });
    if (!currentYear)
      throw new NotFoundException('Chưa cấu hình năm học hiện tại!');

    const students = await this.repoEnrollment
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.student', 'student')
      .leftJoin('student.studentProfile', 'profile')
      .select([
        'enrollment.grade',
        'student.username',
        'profile.code',
        'enrollment.id',
        'enrollment.studentId',
      ])
      .where('enrollment.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('enrollment.status = :status', { status: Status.ACTIVE })
      .andWhere('student.role = :role', { role: 'Student' })
      .andWhere('enrollment.studentStatus = :studentStatus', {
        studentStatus: 'CT',
      })
      .orderBy(
        `CAST(regexp_replace(enrollment.grade, '\\D', '', 'g') AS INTEGER)`,
        'ASC',
      )
      .getMany();

    return students.map((student) => {
      return {
        studentId: student.studentId,
        enrollmentId: student.id,
        grade: student.grade,
        username: student.student.username,
        code: student.student.studentProfile.code,
      };
    });
  }

  async getLeaveRequests(user: User, params: QueryLeaveRequestDto) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new NotFoundException('Năm học hiện tại không tồn tại');
    }

    const query = this.repoLeaveRequest
      .createQueryBuilder('lr')
      .leftJoin('lr.user', 'student')
      .leftJoin(
        'student.enrollments',
        'enrollments',
        'enrollments.academicYearId = :yearId',
        { yearId: currentYear.id },
      )
      .leftJoin('student.studentProfile', 'profile')
      .select([
        'lr.id AS id',
        'lr.date AS date',
        'lr.reason AS reason',
        'lr.type AS type',
        'student.id AS student_id',
        'student.username AS student_username',
        'enrollments.grade AS grade',
      ])
      .where('lr.type = :type', { type: LeaveType.STUDENT_LEAVE })
      .andWhere('lr.status = :status', { status: Status.ACTIVE });

    this.setSearch(query, params);

    const { filter } = params;
    if (filter && filter.startDate && filter.endDate) {
      const { startDate, endDate } = filter;
      query.andWhere('lr.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.getRawMany();
  }

  async createLeaveRequest(user: User, dto: CreateLeaveRequestDto) {
    const { userId, date, reason } = dto;
    const student = await this.repoUser.findOne({
      where: { id: userId, role: 'Student' },
    });
    if (!student) {
      throw new NotFoundException('Học sinh không tồn tại');
    }
    const leaveRequest = this.repoLeaveRequest.create({
      userId,
      date,
      reason,
      type: LeaveType.STUDENT_LEAVE,
      createdById: user.id,
    });

    await this.repoLeaveRequest.save(leaveRequest);
    return;
  }

  async deleteLeaveRequest(user: User, id: number) {
    const leaveRequest = await this.repoLeaveRequest.findOne({ where: { id } });
    if (!leaveRequest) {
      throw new NotFoundException('Đơn xin nghỉ học không tồn tại');
    }
    const newRecord = this.repoLeaveRequest.merge(leaveRequest, {
      status: Status.DELETED,
      updatedById: user.id,
    });
    await this.repoLeaveRequest.save(newRecord);
    return;
  }

  protected setSearch(queryBuilder, params) {
    const { searchFields, search } = params;
    if (searchFields && search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          searchFields.forEach((key) =>
            RegExp(/\.(?=[A-Za-z])/).exec(key)
              ? qb.orWhere(
                  `LOWER(unaccent(CAST(${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                )
              : qb.orWhere(
                  `LOWER(unaccent(CAST(${'users'}.${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                ),
          );
        }),
      );
    }
    return queryBuilder;
  }
}
