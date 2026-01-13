import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

export class FilterStudentTrialDto {}

export class QueryStudentTrialDto extends factoryQuerySpecificationDto<FilterStudentTrialDto>(
  {
    searchFields: ['profile.code', 'student.username'],
  },
) {}

export class CreateFeedbackTrialDto {
  @ApiProperty({ example: 4 })
  @IsInt()
  @IsNotEmpty()
  enrollmentId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(4)
  sessionNumber: number;

  @ApiProperty({ example: '2026-01-06' })
  @IsDateString()
  learningDate: string;

  @ApiProperty({ example: 'om lanh rat nang' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
