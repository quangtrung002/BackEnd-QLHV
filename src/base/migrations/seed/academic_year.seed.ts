import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYearEntity } from 'src/app/student-profile/entities/academic-year.entity';
import { Repository } from 'typeorm';

const data = {
  name: '2025-2026',
  startDate: new Date('2025-09-05'),
  endDate: new Date('2026-05-31'),
  isCurrent: true,
};

@Injectable()
export class AcademicYeaeService {
  constructor(
    @InjectRepository(AcademicYearEntity)
    private readonly repoAcademicYear: Repository<AcademicYearEntity>,
  ) {}
  async seed() {
    const count = await this.repoAcademicYear.count();
    if (count) return;
    return this.repoAcademicYear.save(data);
  }
}
