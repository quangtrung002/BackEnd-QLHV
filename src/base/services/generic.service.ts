import {
  BaseEntity,
  Brackets,
  DeepPartial,
  Not,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QuerySpecificationDto } from '../dtos/query-specification.dto';
import { randomAlphabet } from '../utils/function';
import { castArray } from 'lodash';
 
export class GenericService<T extends BaseEntity> {
  constructor(repository?: Repository<T>) {
    if (repository) {
      this.repository = repository;
    }
  }

  protected aliasName: string;
  protected repository: Repository<T>;

  async _checkDataExist(
    currentUser,
    id,
    data: DeepPartial<T>,
  ): Promise<{ success: boolean; errorMsg: string }> {
    return {
      success: true,
      errorMsg: '',
    };
  }

  async _checkFieldExist($value, $field, $id): Promise<boolean> {
    const $where = {};
    $where[$field] = $value;
    if ($id) {
      $where['id'] = Not($id);
    }
    const $count = await this.repository.count({
      where: $where,
    });

    return $count > 0;
  }

  async _checkViewRecord(results, currentUser, params) {
    return false;
  }

  _joinRelation(queryBuilder: SelectQueryBuilder<T>, params = {}) {
    return queryBuilder;
  }

  _filterByUser(currentUser, queryBuilder: SelectQueryBuilder<T>, params = {}) {
    return queryBuilder;
  }

  _viewJoinRelation(queryBuilder: SelectQueryBuilder<T>) {
    return queryBuilder;
  }

  setOrderBy(query, params): any {
    const { sort = undefined } = params;
    if (sort) {
      Object.entries(sort).map(([sortByColumn, sortDirection]) => {
        RegExp(/\.(?=[A-Za-z])/).exec(sortByColumn)
          ? query.addOrderBy(`${sortByColumn}`, sortDirection)
          : query.addOrderBy(
              `${this.aliasName}.${sortByColumn}`,
              sortDirection,
            );
      });
    }
    return query;
  }

  protected setSearch(
    queryBuilder: SelectQueryBuilder<T>,
    params,
  ): SelectQueryBuilder<T> {
    const { searchFields, search } = params;
    if (searchFields && search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          searchFields.forEach((key) =>
            RegExp(/\.(?=[A-Za-z])/).exec(key)
              ? qb.orWhere(
                  `LOWER(unaccent(CAST(${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                )
              : qb.orWhere(
                  `LOWER(unaccent(CAST(${this.aliasName}.${key} AS varchar))) ILIKE LOWER(unaccent(:search))`,
                  { search: `%${search}%` },
                ),
          );
        }),
      );
    }
    return queryBuilder;
  }

  protected setFilter(
    queryBuilder: SelectQueryBuilder<T>,
    { filter }: QuerySpecificationDto,
  ): SelectQueryBuilder<T> {
    if (filter) {
      Object.entries(filter).forEach((item) =>
        this._processFilter(queryBuilder, item),
      );
    }
    return queryBuilder;
  }

  private _processFilter(
    queryBuilder: SelectQueryBuilder<T>,
    [filterKey, filterValues]: [string, any],
  ): SelectQueryBuilder<T> {
    // eslint-disable-next-line prefer-const
    let [key, suffix] = filterKey.split('_');
    suffix = suffix?.toUpperCase();
    const { sqlRaw, queryParams } = this._processFilterBySuffix(
      suffix,
      key,
      filterValues,
    );

    sqlRaw && queryBuilder.andWhere(sqlRaw, queryParams);
    return queryBuilder;
  }

  private _processFilterBySuffix(
    suffix: string,
    key: string,
    filterValues: string,
    alias: string = this.aliasName,
  ) {
    let sqlRaw: string;
    let queryParams: ObjectLiteral;
    const randomKey: string = randomAlphabet(10);

    if (key.includes('.')) {
      const [filterAlias, filterColumn] = key.split('.');
      return this._processFilterBySuffix(
        suffix,
        filterColumn,
        filterValues,
        filterAlias,
      );
    }

    if (suffix === 'IN') {
      sqlRaw = `${alias}.${key} IN (:...${randomKey})`;
      queryParams = { [randomKey]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = null);
      return { sqlRaw, queryParams };
    }

    if (suffix === 'NOTIN') {
      sqlRaw = `${alias}.${key} NOT IN (:...${randomKey})`;
      queryParams = { [randomKey]: castArray(filterValues) };
      (!Array.isArray(filterValues) || filterValues.length === 0) &&
        (sqlRaw = null);
      return { sqlRaw, queryParams };
    }

    if (suffix === 'RANGE') {
      const randomEndDateKey: string = randomAlphabet(10);
      sqlRaw = `${alias}.${key} between :${randomKey} and :${randomEndDateKey}`;
      queryParams = {
        [randomKey]: filterValues[0],
        [randomEndDateKey]: filterValues[1],
      };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'ISNULL') {
      sqlRaw = `${alias}.${key} IS ${filterValues ? '' : 'NOT'} NULL`;
      queryParams = {};
      return { sqlRaw, queryParams };
    }
    if (suffix === 'GTE') {
      sqlRaw = `${alias}.${key} >= :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'LTE') {
      sqlRaw = `${alias}.${key} <= :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'GT') {
      sqlRaw = `${alias}.${key} > :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'LT') {
      sqlRaw = `${alias}.${key} < :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'CONTAIN') {
      sqlRaw = `${alias}.${key} @> :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'OVERLAP') {
      sqlRaw = `${alias}.${key} && :${randomKey}`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }

    if (suffix === 'CONTAINALL') {
      sqlRaw = `${alias}.${key} @> all(array[:...${randomKey}]::jsonb[])`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'CONTAINANY') {
      sqlRaw = `${alias}.${key} @> any(array[:...${randomKey}]::jsonb[])`;
      queryParams = { [randomKey]: filterValues };
      return { sqlRaw, queryParams };
    }
    if (suffix === 'ISEMPTY') {
      sqlRaw = `array_length(${alias}.${key}, 1) IS ${
        filterValues ? '' : 'NOT'
      } NULL`;
      queryParams = {};
      return { sqlRaw, queryParams };
    }

    sqlRaw = `${alias}.${key} = :${randomKey}`;
    queryParams = { [randomKey]: filterValues };
    return { sqlRaw, queryParams };
  }

  getCurrentTime() {
    return new Date();
  }
}
