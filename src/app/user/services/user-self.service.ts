import { CommonService } from 'src/base/services/common.service';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto, SetPasswordDto } from '../dtos/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityId } from 'typeorm/repository/EntityId';
import { Status } from 'src/base/utils/status';
import { AUTH_VERSION_DIV } from '../constants/user.constants';
import { Role } from 'src/base/authorization/role/role.enum';

export class UserService extends CommonService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repoUser: Repository<UserEntity>,
  ) {
    super(repoUser);
  }

  protected aliasName: string = 'users';

  async bulkDelete(currentUser, ids: EntityId[]): Promise<void> {
    const { raw: records } = await this.repoUser
      .createQueryBuilder(this.aliasName)
      .update({
        status: Status.DELETED,
        uav: new Date().getTime() % AUTH_VERSION_DIV,
        deletedById: currentUser.id,
      })
      .where('id IN (:...ids)', { ids })
      .andWhere('role <> :role', { role: Role.SuperAdmin })
      .returning(['email'])
      .execute();

  }

  async setPassword(id: number, dto: SetPasswordDto) {
    const user = await this.getOneById(id);
    user.hashPw(dto.newPassword);
    await user.save();
  }

  async changePassword(
    id: number,
    newPasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.getOneById(id);
    user.hashPw(newPasswordDto.newPassword);
    await user.save();
  }
}
