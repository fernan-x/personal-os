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
import { MedicationService } from "./medication.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type {
  CreateMedicationInput,
  UpdateMedicationInput,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/medications")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.medicationService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateMedicationInput,
  ) {
    return this.medicationService.create(petId, input);
  }

  @Patch(":medicationId")
  update(
    @Param("medicationId") medicationId: string,
    @Body() input: UpdateMedicationInput,
  ) {
    return this.medicationService.update(medicationId, input);
  }

  @Delete(":medicationId")
  remove(@Param("medicationId") medicationId: string) {
    return this.medicationService.remove(medicationId);
  }
}
