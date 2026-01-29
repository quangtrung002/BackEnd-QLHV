import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  IsDateString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsInt,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from 'src/base/authorization/role/role.enum';
import { Status } from 'src/base/utils/status';
import { ApiProperty } from '@nestjs/swagger';

export class AcademyDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{4}$/)
  year: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

class ShiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class SettingDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AcademyDto)
  currentYear: AcademyDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  shifts?: ShiftDto[];
}

export class CreateManager{
  @ApiProperty({example : "admin@gmail.com"})
  @IsEmail()
  @IsNotEmpty()
  email : string

  @ApiProperty({example : "Admin1"})
  @IsString()
  @IsNotEmpty()
  username : string

  @ApiProperty({example : Role.Manager})
  @IsEnum(Role)
  @IsNotEmpty()
  role : string
}

export class PermissionDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsEnum(Role)
  @IsNotEmpty()
  role?: string;

  @ApiProperty({ example: 7 })
  @IsEnum(Status)
  status?: number;
}
