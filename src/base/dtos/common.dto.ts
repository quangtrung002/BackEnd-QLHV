import { IsArray, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { TransformInt } from '../validators/validator.transformer';

export class IdDto {
  @IsNotEmpty()
  @TransformInt()
  @IsPositive()
  @IsInt()
  id: number;
}

export class IdsDto {
  @IsNotEmpty()
  @IsPositive({ each: true })
  @IsInt({ each: true })
  @IsArray()
  ids: number[];
}

export class UserIdDto {
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  userId: string;
}
