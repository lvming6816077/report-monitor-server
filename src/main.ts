import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ResponseTransformInterceptor } from './utils/response/interceptor/response.default.interceptor';
import { HttpExceptionFilter } from './utils/response/filter/http-execption.filter';
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    
  });
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: false, // 不显示错误信息
    whitelist: false, // 开启过滤 多传字段不报错
  }))
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3001);
}
bootstrap();
