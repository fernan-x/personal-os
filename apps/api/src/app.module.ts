import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HabitsModule } from "./habits/habits.module";
import { AuthModule } from "./auth/auth.module";
import { BudgetModule } from "./budget/budget.module";
import { PuppyModule } from "./puppy/puppy.module";
import { UploadModule } from "./upload/upload.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MealsModule } from "./meals/meals.module";
import { AppController } from "./app.controller";

@Module({
  imports: [DatabaseModule, AuthModule, UploadModule, DashboardModule, HabitsModule, BudgetModule, PuppyModule, MealsModule],
  controllers: [AppController],
})
export class AppModule {}
