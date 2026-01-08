import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

export class CreateStudentProfileDto {
  @ApiProperty({ example: 'STU001' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Lớp 6' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ example: 'ABC Secondary School' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiPropertyOptional({ example: '2012-05-10' })
  @IsOptional()
  @IsDateString()
  dob?: Date;

  @ApiPropertyOptional({ example: 'TN', description: 'TN | CT' })
  @IsNotEmpty()
  @IsString()
  active: string;

  @ApiPropertyOptional({ example: 'Hanoi, Vietnam' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional({ example: 'Nguyen Thi B' })
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  fatherPhone?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  motherPhone?: string;

  @ApiProperty({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  referrer?: string;
}

export class CreateStudentDto {
  @ApiProperty({
    example: 'học viên A',
    description: 'Họ và tên học viên',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  username: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại liên hệ',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'tung@gita.edu.vn',
    description: 'Email liên hệ',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateStudentProfileDto)
  studentProfile: CreateStudentProfileDto;
}

class UpdateStudentProfileDto extends PartialType(CreateStudentProfileDto) {}

export class UpdateStudentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentProfileDto)
  studentProfile?: UpdateStudentProfileDto;
}

//DTO điểm của học sinh
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

//DTO ngày nghỉ của học sinh
export class FilterLeaveRequestDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class QueryLeaveRequestDto extends factoryQuerySpecificationDto<FilterLeaveRequestDto>(
  {
    searchFields: ['student.username', 'profile.code'],
    filterCls: FilterLeaveRequestDto,
    filterExample: {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    },
  },
) {}

export class CreateLeaveRequestDto {
  @ApiProperty({ example: '1', description: 'ID học sinh' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: '2025-01-15', description: 'Ngày xin nghỉ học' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Ốm đau', description: 'Lý do xin nghỉ học' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

// DTO học sinh học trải nghiệm
export class FilterStudentTrialDto {}

export class QueryStudentTrialDto extends factoryQuerySpecificationDto<FilterStudentTrialDto>(
  {
    searchFields: ['profile.code', 'student.username'],
  },
) {}

export class CreateFeedbackTrialDto {
  @ApiProperty({example : 4})
  @IsInt()
  @IsNotEmpty()
  enrollmentId: number;

  @ApiProperty({example : 1})
  @IsInt()
  @Min(1)
  @Max(4)
  sessionNumber: number; 

  @ApiProperty({example : "2026-01-06"})
  @IsDateString()
  learningDate: string; 

  @ApiProperty({example : "om lanh rat nang"})
  @IsString()
  @IsNotEmpty()
  comment : string
}