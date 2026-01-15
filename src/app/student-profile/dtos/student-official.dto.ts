import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

class FilterOfficialFeedback {
  @IsOptional()
  @IsNumber()
  @Min(1)
  week: number;

  @IsOptional()
  @IsString()
  grade: string;

  @IsOptional()
  @IsString()
  @IsEnum(['done', 'pending', ''])
  status: string;
}

export class QueryOfficialStudentFeedback extends factoryQuerySpecificationDto<FilterOfficialFeedback>(
  {
    filterCls: FilterOfficialFeedback,
    filterExample: {
      week: 1,
      grade: 'Lớp 7',
      status : "done"
    },
  },
) {}
