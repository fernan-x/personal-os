import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { TrainingMilestoneService } from "./training-milestone.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type {
  CreateTrainingMilestoneInput,
  UpdateTrainingMilestoneInput,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/training")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class TrainingMilestoneController {
  constructor(
    private readonly trainingMilestoneService: TrainingMilestoneService,
  ) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.trainingMilestoneService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateTrainingMilestoneInput,
  ) {
    return this.trainingMilestoneService.create(petId, input);
  }

  @Patch(":milestoneId")
  update(
    @Param("milestoneId") milestoneId: string,
    @Body() input: UpdateTrainingMilestoneInput,
  ) {
    return this.trainingMilestoneService.update(milestoneId, input);
  }

  @Delete(":milestoneId")
  remove(@Param("milestoneId") milestoneId: string) {
    return this.trainingMilestoneService.remove(milestoneId);
  }
}
