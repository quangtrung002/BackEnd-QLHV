import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

export class CreateTeacherDto {
  @ApiProperty({
    example: 'thầy Tùng',
    description: 'Họ và tên giáo viên',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({
    example: 'Trungbin002@',
    description:
      'Mật khẩu đăng nhập (Tối thiểu 6 ký tự) bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiPropertyOptional({
    example: '0912345678',
    description: 'Số điện thoại liên hệ',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'tung@gita.edu.vn',
    description: 'Email liên hệ',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @ApiPropertyOptional({
    example: ['18:15 - 19:45', '20:00 - 21:30'],
    description: 'Danh sách các ca dạy cố định',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Shifts phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi ca dạy phải là một chuỗi ký tự' })
  shifts?: string[];
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}

class FilterTeacherDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  month: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  year: number;
}

export class QueryTeacherDto extends factoryQuerySpecificationDto<FilterTeacherDto>(
  {
    searchFields: [],
    filterCls: FilterTeacherDto,
    filterExample: { month: 1, year: 2026 },
  },
) {}

export class CreateAbsenceDto {
  @ApiProperty({ example: '1', description: 'ID thầy giáo' })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  teacherId: number;

  @ApiProperty({ example: '2025-01-15', description: 'Ngày xin nghỉ ' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Ốm đau', description: 'Lý do xin nghỉ ' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdateAttendanceDto {
  @ApiProperty({ example: '3', description: 'ID thầy giáo' })
  @IsInt()
  @Type(() => Number)
  teacherId: number;

  @ApiProperty({ example: '1', description: 'Tháng điểm danh' })
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @ApiProperty({ example: '2026', description: 'Năm điểm danh' })
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: '18:15-20:00', description: 'Tên ca điểm danh' })
  @IsString()
  shiftName: string;

  @ApiProperty({
    example: [1],
    description: 'Danh sách ngày trong tháng đã điểm danh',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  days?: number[];
}
