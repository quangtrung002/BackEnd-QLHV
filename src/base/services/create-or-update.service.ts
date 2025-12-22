import { BaseEntity, DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { ListService } from './list.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SuccessException } from '../exceptions/custom.exception';
import { User } from 'src/auth/interfaces/user.class';

export class CreateOrUpdateService<
  T extends BaseEntity,
> extends ListService<T> {
  constructor(repository: Repository<T>) {
    super(repository);
  }

  public async create(currentUser, dto: DeepPartial<T> | T): Promise<any> {
    const dataEntity = this._beforeInsertData(currentUser, dto);

    const entity: T = this.repository.create(dataEntity);
    const dataAlreadyExist = await this._checkDataExist(currentUser, null, dto);
    if (!dataAlreadyExist.success) {
      throw new ConflictException(dataAlreadyExist.errorMsg);
    }

    const response = await this.repository.save(entity);

    return { id: response['id'] };
  }

  public async update(
    currentUser: User,
    id: number,
    dto: DeepPartial<T> | T,
  ): Promise<any> {
    const dataAlreadyExist = await this._checkDataExist(currentUser, id, dto);
    if (!dataAlreadyExist.success) {
      throw new ConflictException(dataAlreadyExist.errorMsg);
    }

    const oldRecord = await this.getOneById(id);
    const newRecord = this._beforeUpdateData(currentUser, dto, oldRecord);
    this.repository.merge(oldRecord, newRecord);
    await this.repository.save(oldRecord);

    throw new SuccessException(`Update ${this.aliasName} successfully`);
  }

  async getOneById(id: number): Promise<T> {
    const record = await this.repository
      .createQueryBuilder(this.aliasName)
      .select()
      .where(this.aliasName + '.id = :paramId', { paramId: id })
      .getOne();
    return this.recordOrNotFound(record);
  }

  async updateManyBy(
    currentUser: User,
    where: FindOptionsWhere<T>,
    dto,
    option?,
  ) {
    if (option?.includeOldRecord) {
      const oldRecords = await this.repository.find({ where });
      if (!oldRecords.length) return;

      const updateDto = await this.actionPreUpdateMany(
        currentUser,
        oldRecords,
        dto,
        option,
      );
      const newRecords: T[] = oldRecords.map((record) =>
        Object.assign({}, record, updateDto),
      );
      await this.repository.save(newRecords);
    }
    const updateDto = await this.actionPreUpdateMany(
      currentUser,
      [],
      dto,
      option,
    );
    await this.repository.update(where, updateDto);
  }

  async actionPreUpdateMany(currentUser: User, oldRecord: T[], dto, option?) {
    return dto;
  }

  actionPreUpdate(currentUser: User, dto: DeepPartial<T> | T, oldRecord: T) {
    dto['createdAt'] = this.getCurrentTime();
    dto['updatedAt'] = this.getCurrentTime();
    return dto;
  }

  _beforeUpdateData(
    currentUser: User,
    dto: DeepPartial<T> | T,
    oldRecord,
  ): DeepPartial<T> | T {
    return this.actionPreUpdate(currentUser, dto, oldRecord);
  }

  _beforeInsertData(
    currentUser: User,
    dto: DeepPartial<T> | T,
  ): DeepPartial<T> | T {
    dto['createdAt'] = this.getCurrentTime();
    dto['updatedAt'] = this.getCurrentTime();
    return dto;
  }
}
