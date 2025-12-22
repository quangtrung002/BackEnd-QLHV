import { Exclude } from 'class-transformer';
import { SettingDataType } from 'src/base/utils/setting.enum';
import { Status } from 'src/base/utils/status';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class SettingEntity {
  @PrimaryGeneratedColumn()
  @Exclude({ toPlainOnly: true })
  id: number;

  @Column({ unique: true })
  settingKey: string;

  @Column('json')
  settingValue: any | Record<string, unknown>;

  @Column({ default: SettingDataType.STRING })
  dataType: SettingDataType;

  @Column({ default: Status.ACTIVE, enum: Status })
  status: number;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date | null;

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date | null;
}
