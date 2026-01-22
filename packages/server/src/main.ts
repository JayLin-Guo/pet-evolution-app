import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors({
    origin: true, // 允许所有来源（开发环境）
    credentials: true,
  });

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤掉未定义的属性
      forbidNonWhitelisted: false, // 不禁止未定义的属性
      transform: true, // 自动转换类型
    }),
  );

  // 统一响应格式拦截器（所有成功响应都会包装为 { code, data, msg }）
  app.useGlobalInterceptors(new TransformInterceptor());

  // 统一异常处理过滤器（所有异常都会返回 { code, data, msg }）
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 8011;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST http://localhost:${port}/api/auth/register`);
  console.log(`   GET  http://localhost:${port}/api/auth/verify`);
  console.log(`   GET  http://localhost:${port}/api/pet-eggs`);
  console.log(`   POST http://localhost:${port}/api/pet-eggs/draw`);
  console.log(`   POST http://localhost:${port}/api/pets/adopt`);
  console.log(`   GET  http://localhost:${port}/api/pets`);
}
void bootstrap();
