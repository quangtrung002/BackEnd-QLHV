import { Repository } from 'typeorm';
import { BaseEntity } from '../entities/common.entity';
import { DeleteService } from './delete.service';

export class CommonService<T extends BaseEntity> extends DeleteService<T> {
  constructor(repository?: Repository<T>) {
    super(repository);
  }
}
