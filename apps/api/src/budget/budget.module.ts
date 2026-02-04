import { Module } from "@nestjs/common";
import { BudgetGroupController } from "./budget-group.controller";
import { BudgetGroupService } from "./budget-group.service";
import { ExpenseCategoryController } from "./expense-category.controller";
import { ExpenseCategoryService } from "./expense-category.service";
import { MonthlyPlanController } from "./monthly-plan.controller";
import { MonthlyPlanService } from "./monthly-plan.service";
import { IncomeController } from "./income.controller";
import { IncomeService } from "./income.service";
import { PlannedExpenseController } from "./planned-expense.controller";
import { PlannedExpenseService } from "./planned-expense.service";
import { EnvelopeController } from "./envelope.controller";
import { EnvelopeService } from "./envelope.service";
import { EnvelopeEntryController } from "./envelope-entry.controller";
import { EnvelopeEntryService } from "./envelope-entry.service";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";

@Module({
  controllers: [
    BudgetGroupController,
    ExpenseCategoryController,
    MonthlyPlanController,
    IncomeController,
    PlannedExpenseController,
    EnvelopeController,
    EnvelopeEntryController,
  ],
  providers: [
    BudgetGroupService,
    ExpenseCategoryService,
    MonthlyPlanService,
    IncomeService,
    PlannedExpenseService,
    EnvelopeService,
    EnvelopeEntryService,
    BudgetGroupMemberGuard,
  ],
  exports: [BudgetGroupMemberGuard],
})
export class BudgetModule {}
