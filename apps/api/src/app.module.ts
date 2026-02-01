import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HabitsModule } from "./habits/habits.module";
import { AppController } from "./app.controller";

@Module({
  imports: [DatabaseModule, HabitsModule],
  controllers: [AppController],
})
export class AppModule {}
