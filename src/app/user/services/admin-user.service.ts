import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/base/services/common.service';

@Injectable()
export class AdminUserService extends CommonService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly repoUser: Repository<UserEntity>,
  ) {
    super(repoUser);
  }

  protected aliasName: string = 'users';

  _joinRelation(
    queryBuilder: SelectQueryBuilder<UserEntity>,
    params?: {},
  ): SelectQueryBuilder<UserEntity> {
    queryBuilder.leftJoinAndSelect(this.aliasName + '.articles', 'articles');
    return queryBuilder;
  }

  actionPreList(
    queryBuilder: SelectQueryBuilder<UserEntity>,
  ): SelectQueryBuilder<UserEntity> {
    queryBuilder.leftJoinAndSelect(this.aliasName + '.articles', 'articles');
    return queryBuilder;
  }
}
