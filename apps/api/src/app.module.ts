import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HabitsModule } from "./habits/habits.module";
import { AuthModule } from "./auth/auth.module";
import { BudgetModule } from "./budget/budget.module";
import { AppController } from "./app.controller";

@Module({
  imports: [DatabaseModule, AuthModule, HabitsModule, BudgetModule],
  controllers: [AppController],
})
export class AppModule {}
