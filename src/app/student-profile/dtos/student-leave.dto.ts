import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { factoryQuerySpecificationDto } from 'src/base/dtos/query-specification.dto';

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
