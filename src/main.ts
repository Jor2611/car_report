import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if(process.env.NODE_ENV === 'dev'){
    const swaggerConfig = new DocumentBuilder()
      .addBearerAuth({ name: 'Authorization', type: 'http' })
      .setTitle('Car Report')
      .setDescription('Reports with prices for used cars!')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app,swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT);
}
bootstrap();
