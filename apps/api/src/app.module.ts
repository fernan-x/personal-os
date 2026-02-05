import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HabitsModule } from "./habits/habits.module";
import { AuthModule } from "./auth/auth.module";
import { BudgetModule } from "./budget/budget.module";
import { PuppyModule } from "./puppy/puppy.module";
import { AppController } from "./app.controller";

@Module({
  imports: [DatabaseModule, AuthModule, HabitsModule, BudgetModule, PuppyModule],
  controllers: [AppController],
})
export class AppModule {}
