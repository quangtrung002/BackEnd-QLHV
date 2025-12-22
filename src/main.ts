import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './base/exceptions/all-exception-filter';
import { InitSwagger } from './base/swagger/swagger.setup';
import { ResponesTransformInterceptor } from './base/middleware/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const optionCors = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  };
  app.enableCors(optionCors);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      skipMissingProperties: false,
      transform: true,
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            success: false,
            msg: Object.values(errors[0].constraints)[0],
          },
          HttpStatus.BAD_REQUEST,
        );
      },
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ResponesTransformInterceptor())
  app.useGlobalFilters(new AllExceptionFilter());

  InitSwagger(app);

  await app.listen(3001);
}
bootstrap();
