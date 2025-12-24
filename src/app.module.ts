import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './app/user/user.module';
import { CodeModule } from './base/otp/otp.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { MailModule } from './base/mail/mail.module';
import { RoleGuard } from './base/authorization/role/role.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './auth/guards/jwt-refresh-auth.guard';
import { SeederModule } from './base/migrations/seed/seeder.module';
import { SettingsModule } from './app/setting/setting.module';
import { StudentModule } from './app/student-profile/student.module';
import { TeacherModule } from './app/teacher/teacher.module';
import { ValidationPipe } from './base/middleware/validation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      logging: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
    }),
    SeederModule,
    MailModule,
    AuthModule,
    UserModule,
    CodeModule,
    SettingsModule,
    StudentModule,
    TeacherModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide : APP_GUARD,
    //   useClass : JwtRefreshAuthGuard
    // },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
