import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';

import { Type as NestType } from '@nestjs/common';
import { TransformSort } from '../validators/validator.transformer';
import { config } from 'src/configs/config.service';
import * as _ from 'lodash';

export class PaginationSpecificationDto {
  @IsOptional()
  @Transform(({ value }) => value && parseInt(String(value)))
  @IsPositive()
  @Max(config.PAGINATION_LIMIT)
  limit?: number = config.PAGINATION_LIMIT;

  @IsOptional()
  @Transform(({ value }) => value && parseInt(String(value)))
  @IsPositive()
  page?: number = config.PAGINATION_PAGE;

  @ApiHideProperty()
  disablePagination?: boolean;
}

export interface ISort {
  [key: string]: 'DESC' | 'ASC';
}

export class SortSpecificationDto {
  @ApiPropertyOptional({
    type: String,
    example: 'id,-createdAt',
  })
  @IsOptional()
  @TransformSort()
  @IsObject()
  sort?: ISort;
}

export class SearchSpecificationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];
}

export class QuerySpecificationDto<
  TFilter = Record<string, any>,
> extends IntersectionType(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
) {
  filter?: TFilter;
}

interface IFactoryOption {
  sortFields?: string[];
  searchFields?: string[];
  filterCls?: NestType;
  filterExample?: string | Record<string, any>;
  filterOptions?: ApiPropertyOptions;
}

type FactoryType<TFilter> = NestType<
  Pick<QuerySpecificationDto<TFilter>, keyof QuerySpecificationDto<TFilter>>
>;

export const factoryQueryDto = <TFilter>(
  options: IFactoryOption = {},
): FactoryType<TFilter> => {
  let { filterExample } = options;
  if (filterExample && typeof filterExample !== 'string')
    filterExample = JSON.stringify(filterExample);

  class Factory extends SearchSpecificationDto {
    @ApiProperty({
      type: String,
      example: 'id,-createdAt',
    })
    @IsNotEmpty()
    @TransformSort(options.sortFields)
    @IsObject()
    sort?: ISort;

    @ApiProperty({ name: 'searchFields[]' })
    @IsNotEmpty()
    @IsIn(options.searchFields, { each: true })
    @IsString({ each: true })
    @IsArray()
    searchFields?: string[] = options.searchFields;

    @ApiProperty({
      type: String,
      example: filterExample,
      ...options.filterOptions,
      description:
        options?.filterCls?.name +
        '<br>' +
        'example: {"createdById": 1}' +
        '<br>' +
        (options?.filterOptions?.description ?? ''),
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => options.filterCls)
    filter?: TFilter;
  }

  class FactoryOptional extends PartialType(Factory) {}

  const pickOptionKeys = [];
  options.sortFields && pickOptionKeys.push('sort');
  options.searchFields &&
    pickOptionKeys.push('searchFields') &&
    pickOptionKeys.push('search');
  options.filterCls && pickOptionKeys.push('filter');

  let pickRequireKeys = [];
  if (options.filterOptions?.required) {
    const removed = _.remove(pickOptionKeys, (o) => o === 'filter');
    pickRequireKeys = pickRequireKeys.concat(removed);
  }

  return options.filterOptions?.required
    ? IntersectionType(
        PickType(FactoryOptional, pickOptionKeys),
        PickType(Factory, pickRequireKeys),
      )
    : PickType(FactoryOptional, pickOptionKeys);
};

export const factorySpecificationQueryDto = <TFilter>(
  options: IFactoryOption = {},
): FactoryType<TFilter> => {
  class SpecificationDto extends IntersectionType(
    PaginationSpecificationDto,
    // SortSpecificationDto,
    // SearchSpecificationDto,
    factoryQueryDto<TFilter>(options),
  ) {}

  return SpecificationDto;
};

export const factoryListQueryDto = <TFilter>(
  options: IFactoryOption = {},
): FactoryType<TFilter> => {
  class SpecificationDto extends IntersectionType(
    // SortSpecificationDto,
    // SearchSpecificationDto,
    factoryQueryDto<TFilter>(options),
  ) {}

  return SpecificationDto;
};

export const factoryQuerySpecificationDto = <TFilter>(
  options: IFactoryOption = {},
): FactoryType<TFilter> => {
  class SpecificationDto extends IntersectionType(
    PaginationSpecificationDto,
    SortSpecificationDto,
    SearchSpecificationDto,
    factoryQueryDto<TFilter>(options),
  ) {}

  return SpecificationDto;
};
