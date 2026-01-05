import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { User } from 'src/auth/interfaces/user.class';
import { CommonService } from 'src/base/services/common.service';
import { DataSource, In, Repository } from 'typeorm';
import { CreateStudentDto, UpdateScoreStudentDto, UpdateStudentDto } from '../dtos/student.dto';
import {
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { StudentProfileEntity } from '../entities/student-profile.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { ScoreEntity } from '../entities/score.entity';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import e from 'express';

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

  async updateStudentScores(enrollmentId : number, scores : UpdateScoreStudentDto) {
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
    });

    await this.repoScore.save(scoreStudent);

    return { id: scoreStudent.id };
  }

}
