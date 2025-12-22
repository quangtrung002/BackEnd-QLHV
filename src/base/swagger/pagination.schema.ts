import { ApiProperty } from '@nestjs/swagger';

export const defaultPayload = {
  success: true,
  msg: 'Successfully action',
  data: null,
};

export abstract class Payload<TData> {
  success?: boolean;
  msg?: string;
  data?: TData | null;
  constructor(partial: Payload<TData>) {
    Object.assign(this, partial);
  }
}

export class PaginatedMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  per_page: number;

  @ApiProperty()
  current_page: number;

  @ApiProperty()
  last_page: number;

  @ApiProperty()
  from: number;

  @ApiProperty()
  to: number;
}

export class PaginatedResult<TData> {
  @ApiProperty()
  data: TData;

  @ApiProperty()
  pagination: PaginatedMeta;
}
