import { InjectRepository } from '@nestjs/typeorm';
import { ScoreEntity } from '../entities/score.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateScoreStudentDto } from '../dtos/student-score.dto';
import { User } from 'src/auth/interfaces/user.class';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';
import { Status } from 'src/base/utils/status';

export class StudentScoreService {
  constructor(
    @InjectRepository(AcademicYearEntity)
    protected readonly repoAcademicYear: Repository<AcademicYearEntity>,
    @InjectRepository(ScoreEntity)
    protected readonly repoScore: Repository<ScoreEntity>,
    @InjectRepository(EnrollmentEntity)
    protected readonly repoEnrollment: Repository<EnrollmentEntity>,
  ) {}

  async getListStudentScore(term: string, grade: string) {
    const currentYear = await this.repoAcademicYear.findOne({
      where: { isCurrent: true },
    });

    if (!currentYear) {
      throw new NotFoundException('Năm học hiện tại không tồn tại');
    }

    let query = this.repoEnrollment
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.student', 's')
      .leftJoinAndSelect('e.scores', 'sc', 'sc.term = :term', { term })
      .where('e.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('s.role = :role', { role: 'Student' })
      .andWhere('e.studentStatus = :studentStatus', {
        studentStatus: 'CT',
      })
      .andWhere('e.status = :status', { status: Status.ACTIVE });
    if (grade && grade.trim() !== '' && grade !== 'Tất cả') {
      query = query.andWhere('e.grade = :grade', { grade });
    }

    const enrollments = await query.getMany();

    return enrollments.map((e) => {
      const score = e.scores?.[0];

      return {
        studentId: e.student.id,
        username: e.student.username,
        grade: e.grade,
        mid: score?.midScore ?? 0,
        gita: score?.gitaScore ?? 0,
        final: score?.finalScore ?? 0,
        enrollmentId: e.id,
      };
    });
  }

  async updateStudentScores(
    user: User,
    enrollmentId: number,
    scores: UpdateScoreStudentDto,
  ) {
    let scoreStudent = await this.repoScore.findOne({
      where: {
        enrollmentId,
        term: scores.term,
      },
    });

    if (!scoreStudent) {
      scoreStudent = this.repoScore.create({
        enrollmentId,
        term: scores.term,
        midScore: scores.mid_score ?? 0,
        gitaScore: scores.gita_score ?? 0,
        finalScore: scores.final_score ?? 0,
        createdById: user.id,
      });
    } else {
      scoreStudent.midScore = scores.mid_score ?? scoreStudent.midScore;
      scoreStudent.gitaScore = scores.gita_score ?? scoreStudent.gitaScore;
      scoreStudent.finalScore = scores.final_score ?? scoreStudent.finalScore;
      scoreStudent.updatedById = user.id;
    }

    await this.repoScore.save(scoreStudent);

    return { id: scoreStudent.id };
  }
}
