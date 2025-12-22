import {
  BaseEntity,
  Brackets,
  DeepPartial,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

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

  // protected setFilter(queryBuilder: SelectQueryBuilder<E>, { filter }: QuerySpecificationDto): SelectQueryBuilder<E> {
  //   if (filter) {
  //     Object.entries(filter)
  //       .forEach((item) => this._processFilter(queryBuilder, item));
  //   }
  //   return queryBuilder;
  // }

  getCurrentTime() {
    return new Date();
  }
}
