import { BaseEntity, DeepPartial, SelectQueryBuilder } from 'typeorm';
import { CreateOrUpdateService } from './create-or-update.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Status } from '../utils/status';
import { SuccessException } from '../exceptions/custom.exception';

export class DeleteService<
  T extends BaseEntity,
> extends CreateOrUpdateService<T> {
  async delete(currentUser, id: number): Promise<any> {
    const oldRecord = await this.getOneById(id);
    if (!this._checkDataBeforeDeleteData(oldRecord)) {
      throw new BadRequestException(this.aliasName + ' has been deleted');
    }
    const newRecord = this._beforeDeleteData(oldRecord);
    newRecord['status'] = Status.DELETED;
    newRecord.save();

    throw new SuccessException(`Delete ${this.aliasName} successfully`);
  }

  _beforeDeleteData(oldRecord: T) {
    return oldRecord;
  }

  _checkDataBeforeDeleteData(record: T) {
    if (record['status'] === Status.DELETED) return false;
    return true;
  }
}
