import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { Status } from 'src/base/utils/status';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

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

export class AdminQueryUserDto extends factoryQuerySpecificationDto({
  searchFields: ['username'],
  filterExample: {
    username: 'Trung bin',
    email: 'admin@gmail.com',
  },
}) {}
