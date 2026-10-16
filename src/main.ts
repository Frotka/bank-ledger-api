import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Bank Ledger API')
    .setDescription(`
### Тестовый доступ:
* **Администратор (полный доступ, RBAC):**
  * **Email:** \`admin@bank.ru\`
  * **Пароль:** \`adminSecret2026\`
* **Клиент:** создаётся через эндпоинт \`POST /users/register\`

> Для выполнения запросов с ролью ADMIN выполните **POST /auth/login** с указанными данными, скопируйте \`access_token\` и вставьте его в кнопку **Authorize** в правом верхнем углу.
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();