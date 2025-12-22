import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';


class AppContactDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  email: string;
  
  @IsNotEmpty()
  @IsString()
  address: string;
  
  @IsNotEmpty()
  @IsString()
  lat: string;

  @IsNotEmpty()
  @IsString()
  lon: string;
}

export class SettingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AppContactDto)
  appContactInfo?: AppContactDto;
  
  @IsOptional()
  @IsString()
  term?: string;
  
  @IsOptional()
  @IsString()
  policy?: string;
  
  @ApiPropertyOptional({ example: '1.0.1' })
  @IsOptional()
  @Matches(/^\d+\.\d+\.\d+$/)
  mobileVersion?: string;

  @IsOptional()
  @IsBoolean()
  recaptcha?: boolean;
}

export class Setting extends SettingDto {
  mobileVersion?: string;
}
