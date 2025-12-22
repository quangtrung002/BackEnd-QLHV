import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModelUserEntity } from './model-user.entity';

export class BaseEntity extends ModelUserEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({
    name: 'status',
    default: 1,
    type: 'int',
  })
  status: number;

  @CreateDateColumn({
    name: 'createdAt',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @UpdateDateColumn({
    name: 'updatedAt',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
    nullable: true,
  })
  updatedAt: Date | null;
}
