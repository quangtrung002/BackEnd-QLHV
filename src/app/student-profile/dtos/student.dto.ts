import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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

  @ApiPropertyOptional( )
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStudentProfileDto)
  studentProfile?: UpdateStudentProfileDto;
}