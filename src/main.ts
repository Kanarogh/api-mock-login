import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
// ✅ 1. IMPORTE AS FERRAMENTAS DO SWAGGER
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Suas configurações existentes (continuam aqui)
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(new ValidationPipe());

  // // ✅ 2. ADICIONE A CONFIGURAÇÃO DO SWAGGER AQUI
  // const config = new DocumentBuilder()
  //   .setTitle('Komsales API')
  //   .setDescription('Documentação interativa da API do sistema Komsales')
  //   .setVersion('1.0')
  //   .addBearerAuth() // Essencial para testar rotas com autenticação JWT
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document); // Define a rota '/api' para a documentação

  // Sua linha para iniciar o servidor (continua aqui)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();