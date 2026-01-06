import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { User } from 'src/auth/interfaces/user.class';
import { CommonService } from 'src/base/services/common.service';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import {
  CreateLeaveRequestDto,
  CreateStudentDto,
  QueryLeaveRequestDto,
  UpdateScoreStudentDto,
  UpdateStudentDto,
} from '../dtos/student.dto';
import {
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { StudentProfileEntity } from '../entities/student-profile.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { ScoreEntity } from '../entities/score.entity';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { LeaveType } from 'src/base/utils/leave-type.enum';
import { Status } from 'src/base/utils/status';

export class AdminStudentService extends CommonService<UserEntity> {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    protected readonly repoUser: Repository<UserEntity>,
    @InjectRepository(StudentProfileEntity)
    protected readonly repoStudentProfile: Repository<StudentProfileEntity>,
    @InjectRepository(AcademicYearEntity)
    protected readonly repoAcademicYear: Repository<AcademicYearEntity>,
    @InjectRepository(ScoreEntity)
    protected readonly repoScore: Repository<ScoreEntity>,
    @InjectRepository(EnrollmentEntity)
    protected readonly repoEnrollment: Repository<EnrollmentEntity>,
    @InjectRepository(LeaveRequestEntity)
    protected readonly repoLeaveRequest: Repository<LeaveRequestEntity>,
  ) {
    super(repoUser);
  }
  protected aliasName: string = 'students';

  async createStudent(user: User, dto: CreateStudentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { studentProfile, email, ...userData } = dto;

      const isExist = await queryRunner.manager.findOne(UserEntity, {
        where: { email },
        relations: ['studentProfile'],
      });

      if (isExist) {
        throw new ConflictException('Email đã tồn tại!');
      }

      const newUser = queryRunner.manager.create(UserEntity, {
        ...userData,
        email,
        password: 'HocvienGITA@123',
        role: 'Student',
        createdById: user.id,
      });

      newUser.hashPw(newUser.password);

      const savedUser = await queryRunner.manager.save(newUser);

      const profile = queryRunner.manager.create(StudentProfileEntity, {
        ...studentProfile,
        userId: savedUser.id,
      });

      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();

      return { id: savedUser.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStudent(user: User, dto: UpdateStudentDto, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { studentProfile, email, ...userData } = dto;

      const existedUser = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
      });

      if (!existedUser) {
        throw new NotFoundException('User không tồn tại');
      }

      Object.assign(existedUser, userData);

      await queryRunner.manager.save(existedUser);

      if (studentProfile) {
        const existedProfile = await queryRunner.manager.findOne(
          StudentProfileEntity,
          {
            where: { userId: existedUser.id },
          },
        );

        if (existedProfile) {
          Object.assign(existedProfile, studentProfile);
          await queryRunner.manager.save(existedProfile);
        } else {
          const newProfile = queryRunner.manager.create(StudentProfileEntity, {
            ...studentProfile,
            userId: existedUser.id,
            updatedById: user.id,
          });
          await queryRunner.manager.save(newProfile);
        }
      }

      await queryRunner.commitTransaction();

      return { id: existedUser.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getListStudentScore(term: string, grade: string) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new NotFoundException('Năm học hiện tại không tồn tại');
    }

    let query = this.repoEnrollment
      .createQueryBuilder('enrollments')
      .leftJoinAndSelect('enrollments.student', 'student')
      .leftJoinAndSelect('enrollments.scores', 'score', 'score.term = :term', {
        term,
      })
      .where('enrollments.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('student.role = :role', { role: 'Student' });

    if (grade && grade.trim() !== '' && grade !== 'Tất cả') {
      query = query.andWhere('enrollments.grade = :grade', { grade });
    }

    const data = await query.getMany();
    const students = data.map((item, idx) => {
      const scoreRecord =
        item.scores && item.scores.length > 0 ? item.scores[0] : null;
      return {
        studentId: item.student.id,
        username: item.student.username,
        grade: item.grade,
        mid: scoreRecord.midScore,
        final: scoreRecord.finalScore,
        gita: scoreRecord.gitaScore,
        enrollmentId: item.id,
      };
    });

    return students;
  }

  async updateStudentScores(
    user: User,
    enrollmentId: number,
    scores: UpdateScoreStudentDto,
  ) {
    const scoreStudent = await this.repoScore.findOne({
      where: { enrollmentId },
    });

    if (!scoreStudent) {
      throw new NotFoundException('Bảng điểm của học sinh không tồn tại');
    }

    Object.assign(scoreStudent, {
      midScore: scores.mid_score ?? scoreStudent.midScore,
      gitaScore: scores.gita_score ?? scoreStudent.gitaScore,
      finalScore: scores.final_score ?? scoreStudent.finalScore,
      updatedById: user.id,
    });

    await this.repoScore.save(scoreStudent);

    return { id: scoreStudent.id };
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

  async getListStudents(user: User) {
    return await this.repoUser
      .createQueryBuilder('u')
      .leftJoin('u.studentProfile', 's')
      .select(['u.id', 'u.username', 's.grade', 's.code'])
      .where('u.role = :role', { role: 'Student' })
      .andWhere('u.status = :status', { status: Status.ACTIVE })
      .orderBy(
        `CAST(regexp_replace(s.grade, '\\D', '', 'g') AS INTEGER)`,
        'ASC',
      )
      .getRawMany();
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
                  `LOWER(unaccent(CAST(${this.aliasName}.${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                ),
          );
        }),
      );
    }
    return queryBuilder;
  }
}
