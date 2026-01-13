import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { Brackets, Not, Repository } from 'typeorm';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateFeedbackTrialDto,
  QueryStudentTrialDto,
} from '../dtos/student-trial.dto';
import { User } from 'src/auth/interfaces/user.class';
import { TrialFeedbackEntity } from '../entities/trial-feedback.entity';
import { Status } from 'src/base/utils/status';

export class StudentTrialService {
  constructor(
    @InjectRepository(AcademicYearEntity)
    protected readonly repoAcademicYear: Repository<AcademicYearEntity>,
    @InjectRepository(EnrollmentEntity)
    protected readonly repoEnrollment: Repository<EnrollmentEntity>,
    @InjectRepository(TrialFeedbackEntity)
    protected readonly repoTrialFeebback: Repository<TrialFeedbackEntity>,
  ) {}

  async getListStudentTrial(user: User, params: QueryStudentTrialDto) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new NotFoundException('Chưa cấu hình năm học hiện tại');
    }

    let query = this.repoEnrollment
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.trialFeedbacks', 'feedback')
      .leftJoinAndSelect('enrollment.assignedTeacher', 'teacher')
      .leftJoinAndSelect('student.studentProfile', 'profile')
      .where('enrollment.studentStatus = :studentStatus', {
        studentStatus: 'TN',
      })
      .andWhere('enrollment.academicYearId = :yearId', {
        yearId: currentYear.id,
      })
      .andWhere('enrollment.status = :status', { status: Status.ACTIVE })
      .orderBy('enrollment.createdAt', 'DESC')
      .addOrderBy('feedback.sessionNumber', 'ASC');

    query = this.setSearch(query, params);

    const data = await query.getMany();

    return data.map((item) => ({
      enrollmentId: item.id,
      studentId: item.student.id,
      username: item.student.username,
      grade: item.grade || 'Chưa xếp lớp',
      code: item.student.studentProfile?.code,
      assignedTeacher: item.assignedTeacher?.username || 'Chưa phân công',
      feedbacks: item.trialFeedbacks.map((fb) => ({
        id: fb.id,
        session: fb.sessionNumber,
        comment: fb.comment,
        date: fb.learningDate,
      })),
    }));
  }

  async getFeedbackTrialById(
    user: User,
    enrollmentId: number,
    sessionNumber: number,
  ) {
    const enrollment = await this.repoEnrollment.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment)
      throw new NotFoundException('Hồ sơ học sinh không tồn tại!');
    const feedback = await this.repoTrialFeebback.findOne({
      where: { enrollmentId, sessionNumber },
    });
    return {
      enrollmentId,
      feedbackId: feedback.id,
      sessionNumber: feedback.sessionNumber,
      date: feedback.learningDate,
      comment: feedback.comment,
    };
  }

  async createFeedbackTrial(user: User, body: CreateFeedbackTrialDto) {
    const { enrollmentId, learningDate, comment, sessionNumber } = body;
    const enrollment = await this.repoEnrollment.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment)
      throw new NotFoundException('Hồ sơ học sinh không tồn tại!');
    if (enrollment.studentStatus !== 'TN')
      throw new BadRequestException('Học sinh này không phải trải nghiệm!');

    const existFb = await this.repoTrialFeebback.findOne({
      where: {
        enrollmentId,
        sessionNumber,
      },
    });
    if (existFb) {
      existFb.comment = comment;
      existFb.updatedById = user.id;
      await this.repoTrialFeebback.save(existFb);
      return;
    }
    const newFb = this.repoTrialFeebback.create({
      enrollmentId,
      learningDate,
      comment,
      sessionNumber,
      createdById: user.id,
    });
    await this.repoTrialFeebback.save(newFb);
    return;
  }

  async updateTrialStudent(user: User, enrollmentId: number) {
    const enrollment = await this.repoEnrollment.findOne({
      where: { id: enrollmentId },
    });
    if (!enrollment)
      throw new NotFoundException('Không tìm thấy thông tin học viên!');

    this.repoEnrollment.merge(enrollment, {
      studentStatus: 'CT',
      updatedById: user.id,
    });
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
                  `LOWER(unaccent(CAST(${'trial-feedbacks'}.${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                ),
          );
        }),
      );
    }
    return queryBuilder;
  }
}
