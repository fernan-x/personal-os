import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HabitsModule } from "./habits/habits.module";

@Module({
  imports: [DatabaseModule, HabitsModule],
})
export class AppModule {}
