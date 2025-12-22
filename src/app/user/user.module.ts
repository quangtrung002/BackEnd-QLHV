import { Module } from '@nestjs/common';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUserService } from './services/admin-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './controllers/user-self.controller';
import { UserService } from './services/user-self.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AdminUserController, UserController],
  providers: [AdminUserService, UserService],
  exports: [AdminUserService, UserService],
})
export class UserModule {}
