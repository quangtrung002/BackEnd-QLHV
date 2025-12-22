import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { Status } from 'src/base/utils/status';
import { Not, Repository } from 'typeorm';
import { RegisterDto } from '../dtos/auth.dto';
import { ConflictException } from '@nestjs/common';

export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
  ) {}

  private aliasName: string = 'users';

  getUserActice(option: Partial<UserEntity>): Promise<UserEntity> {
    return this.repoUser
      .createQueryBuilder(this.aliasName)
      .where(option)
      .andWhere('users.status = :status', { status: Status.ACTIVE })
      .getOne();
  }

  getOneOrNull(option: Partial<UserEntity>): Promise<UserEntity | null> {
    return this.repoUser
      .createQueryBuilder(this.aliasName)
      .where(option)
      .getOne();
  }

  async getUserByRefresh(refresh_token, email): Promise<any> {
    const user = await this.getOneOrNull({ email });
    if (!user) return null;
    const isEqual = user.campareRefreshToken(refresh_token);

    return isEqual ? user : null;
  }

  activeUser(id: number) {
    this.repoUser.update({ id }, { status: Status.ACTIVE });
  }

  async createUser(dto: RegisterDto): Promise<any> {
    const isExist = await this._checkFieldExist(dto.email, 'email', null);
    if (isExist) throw new ConflictException('Email already exists');

    const user = await this.repoUser.create({
      ...dto,
      status: Status.REGISTER_STATUS,
    });

    user.hashPw(dto.password);
    const response = await this.repoUser.save(user);

    return { id: response.id };
  }

  public async _checkFieldExist($value, $field, $id) {
    const $where = {};
    $where[$field] = $value;
    if ($id) {
      $where['id'] = Not($id);
    }
    const $count = await this.repoUser.count({
      where: $where,
    });

    return $count > 0;
  }
}
