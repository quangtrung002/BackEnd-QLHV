import { InjectRepository } from '@nestjs/typeorm';
import { ScoreEntity } from '../entities/score.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateScoreStudentDto } from '../dtos/student-score.dto';
import { User } from 'src/auth/interfaces/user.class';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { AcademicYearEntity } from '../entities/academic-year.entity';

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
      .createQueryBuilder('enrollments')
      .leftJoinAndSelect('enrollments.student', 'student')
      .leftJoinAndSelect('enrollments.scores', 'score')
      .where('enrollments.academicYearId = :yearId', { yearId: currentYear.id })
      .andWhere('score.term = :term', { term })
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
        mid: scoreRecord?.midScore,
        final: scoreRecord?.finalScore,
        gita: scoreRecord?.gitaScore,
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
}
