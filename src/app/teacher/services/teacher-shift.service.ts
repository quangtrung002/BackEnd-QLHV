import { InjectRepository } from '@nestjs/typeorm';
import { TeacherShiftEntity } from '../entities/teacher-shift.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/base/services/common.service';

export class TeacherShiftService extends CommonService<TeacherShiftEntity> {
  constructor(
    @InjectRepository(TeacherShiftEntity)
    private readonly repoTeacherShift: Repository<TeacherShiftEntity>,
  ) {
    super(repoTeacherShift);
  }

  protected aliasName: string = 'teacher_shifts';
}
