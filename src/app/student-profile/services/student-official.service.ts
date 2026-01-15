import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { In, Repository } from 'typeorm';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { WeeklyFeedbackEntity } from '../entities/weekly-feedback.entity';
import { NotFoundException } from 'src/base/exceptions/custom.exception';
import { Status } from 'src/base/utils/status';
import { User } from 'src/auth/interfaces/user.class';
import { QueryOfficialStudentFeedback } from '../dtos/student-official.dto';

export class StudentOfficialService {
  constructor(
    @InjectRepository(AcademicYearEntity)
    protected readonly repoAcademicYear: Repository<AcademicYearEntity>,
    @InjectRepository(EnrollmentEntity)
    protected readonly repoEnrollment: Repository<EnrollmentEntity>,
    @InjectRepository(WeeklyFeedbackEntity)
    protected readonly repoWeeklyFeebback: Repository<WeeklyFeedbackEntity>,
  ) {}

  async getStudentTrialFeedback(
    user: User,
    params: QueryOfficialStudentFeedback,
  ) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new NotFoundException('Chưa cấu hình năm học hiện tại!');
    }

    const { grade, week, status } = params.filter;

    let query = this.repoEnrollment
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 's')
      .leftJoinAndSelect('s.studentProfile', 'p')
      .leftJoinAndSelect('e.assignedTeacher', 't')
      .leftJoinAndSelect(
        'e.weeklyFeedbacks',
        'wf',
        week ? 'wf.week = :week' : undefined,
        week ? { week } : undefined,
      )
      .where('e.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('e.studentStatus = :studentStatus', { studentStatus: 'CT' })
      .andWhere('e.status = :status', { status: Status.ACTIVE });

    if (grade) {
      query = query.andWhere('e.grade = :grade', { grade });
    }

    if (status === 'done') {
      query = query.andWhere(
        "wf.content IS NOT NULL AND TRIM(wf.content) <> ''",
      );
    }

    if (status === 'pending') {
      query = query.andWhere(
        "(wf.content IS NULL OR TRIM(wf.content) = '')",
      );
    }

    query = query.orderBy(
      `CAST(regexp_replace(e.grade, '\\D', '', 'g') AS INTEGER)`,
      'ASC',
    );

    const enrollments = await query.getMany();

    return enrollments.map((er) => {
      const feedback = er.weeklyFeedbacks?.[0];

      return {
        student: {
          username: er.student.username,
          grade: er.grade,
          code: er.student.studentProfile.code,
          assignTeacher: er.assignedTeacher?.username || null,
        },
        feedback: {
          week: week ?? null,
          content: feedback?.content || '',
        },
      };
    });
  }
}
