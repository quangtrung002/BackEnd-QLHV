import { ApiHideProperty } from "@nestjs/swagger";
import { UserEntity } from "src/app/user/entities/user.entity";
import { BaseEntity as OrmBaseEntity, Column, JoinColumn, ManyToOne } from "typeorm";


export class ModelUserEntity extends OrmBaseEntity {
  @Column({ type: 'int', name: 'created_by_id', nullable: true })
  createdById?: number;

  @Column({ type: 'int', name: 'updated_by_id', nullable: true })
  updatedById?: number;

  @Column({ type: 'int', name: 'deleted_by_id', nullable: true })
  deletedById?: number;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserEntity;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: UserEntity;

  @ApiHideProperty()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy?: UserEntity;

}