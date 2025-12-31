import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/app/user/entities/user.entity';
import { User } from 'src/auth/interfaces/user.class';
import { CommonService } from 'src/base/services/common.service';
import { DataSource, Repository } from 'typeorm';
import { CreateStudentDto, UpdateStudentDto } from '../dtos/student.dto';
import {
  ConflictException,
  NotFoundException,
} from 'src/base/exceptions/custom.exception';
import { StudentProfileEntity } from '../entities/student-profile.entity';

export class AdminStudentService extends CommonService<UserEntity> {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    protected readonly repoUser: Repository<UserEntity>,
    @InjectRepository(StudentProfileEntity)
    protected readonly repoStudentProfile: Repository<StudentProfileEntity>,
  ) {
    super(repoUser);
  }
  protected aliasName: string = 'students';
  async createStudent(user: User, dto: CreateStudentDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { studentProfile, email, ...userData } = dto;

      const isExist = await queryRunner.manager.findOne(UserEntity, {
        where: { email },
        relations : ['studentProfile'],
      });

      if (isExist) {
        throw new ConflictException('Email đã tồn tại!');
      }

      const newUser = queryRunner.manager.create(UserEntity, {
        ...userData,
        email,
        password: 'HocvienGITA@123',
        role: 'Student',
      });

      newUser.hashPw(newUser.password);

      const savedUser = await queryRunner.manager.save(newUser);

      const profile = queryRunner.manager.create(StudentProfileEntity, {
        ...studentProfile,
        userId: savedUser.id,
      });

      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();

      return { id: savedUser.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStudent(user: User, dto: UpdateStudentDto, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { studentProfile, email, ...userData } = dto;

      const existedUser = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
      });

      if (!existedUser) {
        throw new NotFoundException('User không tồn tại');
      }

      Object.assign(existedUser, userData);

      await queryRunner.manager.save(existedUser);

      if (studentProfile) {
        const existedProfile = await queryRunner.manager.findOne(
          StudentProfileEntity,
          {
            where: { userId: existedUser.id },
          },
        );

        if (existedProfile) {
          Object.assign(existedProfile, studentProfile);
          await queryRunner.manager.save(existedProfile);
        } else {
          const newProfile = queryRunner.manager.create(StudentProfileEntity, {
            ...studentProfile,
            userId: existedUser.id,
          });
          await queryRunner.manager.save(newProfile);
        }
      }

      await queryRunner.commitTransaction();

      return { id: existedUser.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
