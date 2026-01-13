import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { User } from 'src/auth/interfaces/user.class';
import {
  Brackets,
  DataSource,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import {
  CreateStudentDto,
  QueryStudentDto,
  UpdateStudentDto,
} from '../dtos/student.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { StudentProfileEntity } from '../entities/student-profile.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { ScoreEntity } from '../entities/score.entity';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { Status } from 'src/base/utils/status';
import { TrialFeedbackEntity } from '../entities/trial-feedback.entity';
import { randomAlphabet } from 'src/base/utils/function';
import { castArray } from 'lodash';

export class AdminStudentService {
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
    @InjectRepository(TrialFeedbackEntity)
    protected readonly repoTrialFeebback: Repository<TrialFeedbackEntity>,
  ) {}
  protected aliasName: string = 'enrollment';

  async getAllStudent(user: User, params: QueryStudentDto) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });
    if (!currentYear)
      throw new NotFoundException('Chưa cấu hình năm học hiện tại.');

    let query = this.repoEnrollment
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('student.studentProfile', 'profile')
      .leftJoinAndSelect('enrollment.assignedTeacher', 'teacher')
      .where('enrollment.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('enrollment.status = :status', { status: Status.ACTIVE })
      .andWhere('student.role = :role', { role: 'Student' });

    const { search, filter } = params;
    if (search) query = this.setSearch(query, params);
    if (filter) query = this.setFilter(query, filter);
    query = this.setOrderBy(query, params);

    const data = await query.getMany();
    return data.map((item) => ({
      enrollmentId: item.id,
      studentId: item.student.id,
      username: item.student.username,
      code: item.student.studentProfile?.code || '',
      fatherPhone: item.student.studentProfile?.fatherPhone || '',
      fatherName: item.student.studentProfile?.fatherName || '',
      motherPhone: item.student.studentProfile?.motherPhone || '',
      motherName: item.student.studentProfile?.motherName || '',
      grade: item.grade || 'Chưa xếp lớp',
      status: item.studentStatus,
      assignedTeacher: item.assignedTeacher?.username || 'Chưa phân công',
    }));
  }

  async getStudentById(user: User, enrollmentId: number) {
    const enrollment = await this.repoEnrollment.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment)
      throw new NotFoundException('Không tìm thấy thông tin học viên.');
    if (enrollment.status !== Status.ACTIVE)
      throw new BadRequestException('Học viên đã bị xóa!');
    const student = await this.repoEnrollment
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('student.studentProfile', 'profile')
      .where('student.id = :userId', { userId: enrollment.studentId })
      .getOne();
    return student;
  }

  async createStudent(user: User, dto: CreateStudentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { student, profile, enrollment } = dto;

      const isEmail = await this.repoUser.findOne({
        where: { email: student.email },
      });
      if (isEmail) throw new ConflictException('Email đã tồn tại!');

      const currentYear = await this.repoAcademicYear.findOne({
        where: { isCurrent: true },
      });
      if (!currentYear) {
        throw new NotFoundException('Chưa cấu hình năm học hiện tại');
      }

      const newUser = queryRunner.manager.create(UserEntity, {
        ...student,
        password: 'HocvienGITA@123',
        role: 'Student',
        createdById: user.id,
      });
      newUser.hashPw(newUser.password);
      const savedUser = await queryRunner.manager.save(newUser);

      const studentProfile = queryRunner.manager.create(StudentProfileEntity, {
        ...profile,
        userId: savedUser.id,
      });
      await queryRunner.manager.save(studentProfile);

      const newEnrollment = queryRunner.manager.create(EnrollmentEntity, {
        ...enrollment,
        studentId: newUser.id,
        academicYearId: currentYear.id,
      });
      await queryRunner.manager.save(newEnrollment);

      await queryRunner.commitTransaction();

      return { id: savedUser.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStudent(user: User, dto: UpdateStudentDto, enrollmentId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { student, profile, enrollment } = dto;

      let oldEnrollment = await queryRunner.manager.findOne(EnrollmentEntity, {
        where: { id: enrollmentId },
      });
      if (!oldEnrollment) {
        throw new NotFoundException('Học viên không tồn tại');
      }
      Object.assign(oldEnrollment, {
        ...enrollment,
        updatedById: user.id,
      });
      await queryRunner.manager.save(oldEnrollment);

      let oldStudent = await queryRunner.manager.findOne(UserEntity, {
        where: { id: oldEnrollment.studentId },
        relations: ['studentProfile'],
      });
      Object.assign(oldStudent, {
        ...student,
        updatedById: user.id,
      });
      await queryRunner.manager.save(oldStudent);

      let oldProfile = await queryRunner.manager.findOne(StudentProfileEntity, {
        where: { id: oldStudent.studentProfile.id },
      });
      Object.assign(oldProfile, {
        ...profile,
        updatedById: user.id,
      });
      await queryRunner.manager.save(oldProfile);

      await queryRunner.commitTransaction();

      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteStudent(user: User, enrollmentId: number) {
    const enrollment = await this.repoEnrollment.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Không tìm thấy học viên!');
    this.repoEnrollment.merge(enrollment, { status: Status.DELETED });
    await this.repoEnrollment.save(enrollment);
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

  protected setFilter(queryBuilder, filter) {
    if (filter) {
      Object.entries(filter).forEach((item) =>
        this._processFilter(queryBuilder, item),
      );
    }
    return queryBuilder;
  }

  public _processFilter(
    queryBuilder,
    [filterKey, filterValues]: [string, any],
  ) {
    // eslint-disable-next-line prefer-const
    let [key, suffix] = filterKey.split('_');
    suffix = suffix?.toUpperCase();
    const { sqlRaw, queryParams } = this._processFilterBySuffix(
      suffix,
      key,
      filterValues,
    );

    sqlRaw && queryBuilder.andWhere(sqlRaw, queryParams);
    return queryBuilder;
  }

  public _processFilterBySuffix(
    suffix: string,
    key: string,
    filterValues: string,
    alias: string = this.aliasName,
  ) {
    let sqlRaw: string;
    let queryParams: ObjectLiteral;
    const randomKey: string = randomAlphabet(10);

    if (key.includes('.')) {
      const [filterAlias, filterColumn] = key.split('.');
      return this._processFilterBySuffix(
        suffix,
        filterColumn,
        filterValues,
        filterAlias,
      );
    }

    if (suffix === 'IN') {
      sqlRaw = `${alias}.${key} IN (:...${randomKey})`;
      queryParams = { [randomKey]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = null);
      return { sqlRaw, queryParams };
    }

    if (suffix === 'NOTIN') {
      sqlRaw = `${alias}.${key} NOT IN (:...${randomKey})`;
      queryParams = { [randomKey]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = null);
      return { sqlRaw, queryParams };
    }

    if (suffix === 'RANGE') {
      const randomEndDateKey: string = randomAlphabet(10);
      sqlRaw = `${alias}.${key} between :${randomKey} and :${randomEndDateKey}`;
      queryParams = {
        [randomKey]: filterValues[0],
        [randomEndDateKey]: filterValues[1],
      };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'ISNULL') {
      sqlRaw = `${alias}.${key} IS ${filterValues ? '' : 'NOT'} NULL`;
      queryParams = {};
      return { sqlRaw, queryParams };
    }
    if (suffix === 'GTE') {
      sqlRaw = `${alias}.${key} >= :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'LTE') {
      sqlRaw = `${alias}.${key} <= :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'GT') {
      sqlRaw = `${alias}.${key} > :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'LT') {
      sqlRaw = `${alias}.${key} < :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'CONTAIN') {
      sqlRaw = `${alias}.${key} @> :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'OVERLAP') {
      sqlRaw = `${alias}.${key} && :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'CONTAINALL') {
      sqlRaw = `${alias}.${key} @> all(array[:...${randomKey}]::jsonb[])`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'CONTAINANY') {
      sqlRaw = `${alias}.${key} @> any(array[:...${randomKey}]::jsonb[])`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'ISEMPTY') {
      sqlRaw = `array_length(${alias}.${key}, 1) IS ${
        filterValues ? '' : 'NOT'
      } NULL`;
      queryParams = {};
      return { sqlRaw, queryParams };
    }

    sqlRaw = `${alias}.${key} = :${randomKey}`;
    queryParams = { [randomKey]: filterValues };
    return { sqlRaw, queryParams };
  }

  setOrderBy(query, params): any {
    const { sort = undefined } = params;
    if (sort) {
      Object.entries(sort).map(([sortByColumn, sortDirection]) => {
        RegExp(/\.(?=[A-Za-z])/).exec(sortByColumn)
          ? query.addOrderBy(`${sortByColumn}`, sortDirection)
          : query.addOrderBy(
              `${this.aliasName}.${sortByColumn}`,
              sortDirection,
            );
      });
    }
    return query;
  }
}
