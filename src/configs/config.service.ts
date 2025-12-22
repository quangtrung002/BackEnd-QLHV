import { Injectable } from '@nestjs/common';
import * as customEnv from 'custom-env';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'dev';
const customEnvName = process.env.DOT_ENV_SUFFIX ?? process.env.NODE_ENV;
customEnv.env(customEnvName);
const env = Object.assign({}, process.env);

@Injectable()
export class ConfigService {
  //saft của bcrypt
  PASSWORD_SALT = parseInt(env.PASSWORD_SALT ?? '10', 10);

  //phân trang
  PAGINATION_LIMIT = 50;
  PAGINATION_PAGE = 1;

  //cấu hình của otplib
  OTP_SECRET = env.OTP_SECRET ?? 'super-secret';
  OTP_OPTION = {
    digits: 6,
    step: 60,
    window: 5,
  };
  OTP_ENABLE = (env.OTP_ENABLE ?? 'true').toLowerCase() !== 'false';

  //cấu hình của swagger
  SWAGGER = {
    PRODUCT_NAME: 'Swagger UI Trung Bin',
    VERSION: '1.0',
    CONTACT: {
      IG: 'ig: enqiti.11',
      GMAIL: 'mail: chunbin002@gmail.com',
    },
  };

  // DB
  DB_TYPE = (env.DB_TYPE ?? 'postgres') as 'postgres' | 'mysql';
  DB_HOST = env.DATABASE_HOST ?? 'localhost';
  DB_PORT = parseInt(env.DATABASE_PORT ?? '5432', 10);
  DB_USERNAME = env.DATABASE_USERNAME ?? 'postgres';
  DB_PASSWORD = env.DATABASE_PASSWORD ?? 'password';
  DB_DATABASE = env.DATABASE_NAME ?? '';

  // //Email
  EMAIL_USE_TLS =
    (env.EMAIL_USE_TLS ?? 'true').toLowerCase() === 'true';
  EMAIL_HOST = env.EMAIL_HOST ?? 'smtp.gmail.com';
  EMAIL_USER = env.EMAIL_USER ?? 'example@gmail.com';
  EMAIL_PASSWORD = env.EMAIL_PASS ?? 'password-application';
  EMAIL_PORT = parseInt(env.EMAIL_PORT ?? '587', 10);
}

export const config = new ConfigService();
