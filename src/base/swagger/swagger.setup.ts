import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'src/configs/config.service';

export const InitSwagger = (app: INestApplication) => {
  const cf = new DocumentBuilder()
    .setTitle(config.SWAGGER.PRODUCT_NAME)
    .setDescription("Description document for rest Trung Bin API")
    .setDescription('Happy coding =))')
    .setVersion(config.SWAGGER.VERSION)
    // .addServer(config.SWAGGER.CONTACT.IG)
    // .addServer(config.SWAGGER.CONTACT.GMAIL)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, cf, {
    extraModels: [],
  });
  SwaggerModule.setup('swagger/api', app, document, {
    customSiteTitle : config.SWAGGER.PRODUCT_NAME
  });
};
