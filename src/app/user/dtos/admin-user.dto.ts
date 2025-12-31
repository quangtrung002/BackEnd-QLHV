import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Status } from 'src/base/utils/status';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';
import { Role } from 'src/base/authorization/role/role.enum';

export class AdminLockUserDto {
  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsEnum(Status)
  status: number;

  @IsNotEmpty()
  @IsPositive({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  userId: number[];
}

class AdminUserFilterDto {
  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  'studentProfile.active': string;

  @IsOptional()
  @IsString()
  'studentProfile.grade': string;
}

export class AdminQueryUserDto extends factoryQuerySpecificationDto<AdminUserFilterDto>(
  {
    searchFields: [
      'username',
      'studentProfile.fatherName',
      'studentProfile.motherName',
      'studentProfile.code',
      'email'
    ],
    filterCls: AdminUserFilterDto,
    filterExample: {
      role: Role.Teacher,
    },
  },
) {}
