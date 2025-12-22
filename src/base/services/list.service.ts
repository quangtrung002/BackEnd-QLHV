import { BaseEntity, Repository, SelectQueryBuilder } from 'typeorm';
import { GenericService } from './generic.service';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/auth/interfaces/user.class';

export class ListService<T extends BaseEntity> extends GenericService<T> {
  constructor(repository: Repository<T>) {
    super(repository);
  }

  protected limit: number;
  protected page: number = 1;
  protected cache: boolean = false;

  async findAll(currentUser: User, params, isPaginate: boolean): Promise<any> {
    let query = this.prepareFindAllQuery(currentUser, params);
    const pagination = await this.setPagination(query, isPaginate, params);
    const records = await query.getMany();
    const data = this.actionPostList(currentUser, records, params);
    return { data, pagination };
  }

  async view(currentUser: User, id: number, params): Promise<any> {
    let query: SelectQueryBuilder<T> = await this.repository.createQueryBuilder(
      this.aliasName,
    );
    query = query.andWhere(this.aliasName + '.id = :id', { id });
    query = this.addSelect(query);
    query = this._joinRelation(query, params);
    query = this._viewJoinRelation(query);
    query = this._filterByUser(currentUser, query);

    let results = await query.getOne();

    return this.recordOrNotFound(results);
  }

  recordOrNotFound(record) {
    if (!record) throw new NotFoundException(this.aliasName + ' not found');
    return record;
  }

  addSelect(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    query = query.select();
    return query;
  }

  setCache(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    if (this.cache) query.cache(this.cache);
    return query;
  }

  //join relation or no join relation
  actionPreList(
    query: SelectQueryBuilder<T>,
    currentUser: User,
  ): SelectQueryBuilder<T> {
    return query;
  }

  actionPostList(currentUser : User, records : T[], params){
    return records;
  }

  prepareFindAllQuery(currentUser : User, params): SelectQueryBuilder<T> {
    let query = this.repository.createQueryBuilder(this.aliasName);
    query = this.addSelect(query);
    query = this.actionPreList(query, currentUser);
    query = this.setOrderBy(query, params);
    query = this.setSearch(query, params);
    query = this._filterByUser(currentUser, query);
    query = this.setCache(query);
    return query;
  }

  async setPagination(query, isPaginate, params) {
    let pagination = {};

    if (isPaginate) {
      if (!params['excludeCountItem']) {
        const total = await query.getCount();
        pagination = this.paginate(params, total);
      } else {
        this.limit = params.limit && params.limit > 0 ? params.limit : 20;
        this.page = params.page && params.page > 0 ? params.page : 1;
      }

      let offset = this.limit * (this.page - 1);
      offset = offset > 0 ? offset : 0;
      query.skip(offset).take(this.limit);
    }

    return pagination;
  }

  paginate(params, total) {
    let from = 0,
      lastPage = 0,
      to = this.limit - 1;
    if (params.limit && params.limit > 0) {
      this.limit = parseInt(params.limit);
    } else {
      this.limit = 50;
    }
    if (this.limit) {
      lastPage = Math.ceil(total / this.limit);
    }
    if (params.page && params.page > 0) {
      this.page = parseInt(params.page);
      if (this.page > lastPage) {
        this.page = lastPage;
      }
    } else {
      this.page = 1;
    }

    if (this.page >= 1) {
      from = this.limit * (this.page - 1);
      to = this.limit + from - 1;
    }
    if (to >= total) {
      to = total - 1;
    }

    return {
      total: total,
      per_page: this.limit,
      current_page: this.page,
      last_page: lastPage,
      from: from,
      to: to > 0 ? to : 0,
    };
  }
}
 