import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterScoreStudentDto {
  @ApiPropertyOptional({
    description: 'Học kỳ / niên khóa',
    example: '1_2025_2026',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  term?: string;

  @ApiPropertyOptional({
    description: 'Khối lớp',
    example: 'Lớp 9',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  grade?: string;
}

export class UpdateScoreStudentDto {
  @ApiPropertyOptional({ description: 'Học kì', example: '1_2025_2026' })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({
    description: 'Điểm giữa kỳ',
    example: 7.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mid_score?: number;

  @ApiPropertyOptional({
    description: 'Điểm GITA',
    example: 8,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gita_score?: number;

  @ApiPropertyOptional({
    description: 'Điểm cuối kỳ',
    example: 9,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  final_score?: number;
}
