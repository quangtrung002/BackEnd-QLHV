import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

class FilterStudentDto {
  @IsOptional()
  @IsString()
  'grade': string;

  @IsOptional()
  @IsString()
  'studentStatus': string;
}

export class QueryStudentDto extends factoryQuerySpecificationDto<FilterStudentDto>(
  {
    searchFields: ['student.username', 'profile.code'],
    filterCls: FilterStudentDto,
    filterExample: {
      grade: 'Lớp 7',
      studentStatus: 'TN',
    },
  },
) {}

class CreateProfileDto {
  @ApiProperty({ example: 'STU001' })
  @IsNotEmpty()
  @IsString()
  code: string;

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

class CreateEnrollmentDto {
  @ApiProperty({ example: 'TN', description: 'TN | CT' })
  @IsNotEmpty()
  @IsString()
  studentStatus: string;

  @ApiProperty({ example: 'Lớp 6' })
  @IsString()
  @IsNotEmpty()
  grade: string;

  @ApiProperty({ example: "3" })
  @IsNumberString()
  @IsNotEmpty()
  assignedTeacherId: number;
}

class CreateUserDto {
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
}

export class CreateStudentDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  student: CreateUserDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateEnrollmentDto)
  enrollment: CreateEnrollmentDto;
}

class UpdateProfileDto extends PartialType(CreateProfileDto) {}
class UpdateUserDto extends PartialType(CreateUserDto) {}
class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}

export class UpdateStudentDto {
  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateUserDto)
  student?: UpdateUserDto;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateProfileDto)
  profile?: UpdateProfileDto;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => UpdateEnrollmentDto)
  enrollment?: UpdateEnrollmentDto;
}


