import { Module } from "@nestjs/common";
import { HouseholdController } from "./household.controller";
import { HouseholdService } from "./household.service";
import { PetController } from "./pet.controller";
import { PetService } from "./pet.service";
import { PetDashboardService } from "./pet-dashboard.service";
import { RoutineTemplateController } from "./routine-template.controller";
import { RoutineTemplateService } from "./routine-template.service";
import { DailyChecklistController } from "./daily-checklist.controller";
import { DailyChecklistService } from "./daily-checklist.service";
import { ActivityLogController } from "./activity-log.controller";
import { ActivityLogService } from "./activity-log.service";
import { WeightEntryController } from "./weight-entry.controller";
import { WeightEntryService } from "./weight-entry.service";
import { VetVisitController } from "./vet-visit.controller";
import { VetVisitService } from "./vet-visit.service";
import { VaccinationController } from "./vaccination.controller";
import { VaccinationService } from "./vaccination.service";
import { MedicationController } from "./medication.controller";
import { MedicationService } from "./medication.service";
import { TrainingMilestoneController } from "./training-milestone.controller";
import { TrainingMilestoneService } from "./training-milestone.service";
import { HouseholdMemberGuard } from "./guards/household-member.guard";

@Module({
  controllers: [
    HouseholdController,
    PetController,
    RoutineTemplateController,
    DailyChecklistController,
    ActivityLogController,
    WeightEntryController,
    VetVisitController,
    VaccinationController,
    MedicationController,
    TrainingMilestoneController,
  ],
  providers: [
    HouseholdService,
    PetService,
    PetDashboardService,
    RoutineTemplateService,
    DailyChecklistService,
    ActivityLogService,
    WeightEntryService,
    VetVisitService,
    VaccinationService,
    MedicationService,
    TrainingMilestoneService,
    HouseholdMemberGuard,
  ],
  exports: [HouseholdMemberGuard],
})
export class PuppyModule {}
