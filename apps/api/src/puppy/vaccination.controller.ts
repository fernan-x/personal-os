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
import { VaccinationService } from "./vaccination.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type {
  CreateVaccinationInput,
  UpdateVaccinationInput,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/vaccinations")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.vaccinationService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateVaccinationInput,
  ) {
    return this.vaccinationService.create(petId, input);
  }

  @Patch(":vaccinationId")
  update(
    @Param("vaccinationId") vaccinationId: string,
    @Body() input: UpdateVaccinationInput,
  ) {
    return this.vaccinationService.update(vaccinationId, input);
  }

  @Delete(":vaccinationId")
  remove(@Param("vaccinationId") vaccinationId: string) {
    return this.vaccinationService.remove(vaccinationId);
  }
}
