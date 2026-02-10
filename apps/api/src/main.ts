import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix("api");
  app.enableCors();
  await app.listen(3001);
  console.log(`API is running on port 3001`);
}

bootstrap();
