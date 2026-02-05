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
import { PetService } from "./pet.service";
import { PetDashboardService } from "./pet-dashboard.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type { CreatePetInput, UpdatePetInput } from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly dashboardService: PetDashboardService,
  ) {}

  @Get()
  findAll(@Param("householdId") householdId: string) {
    return this.petService.findAll(householdId);
  }

  @Post()
  create(
    @Param("householdId") householdId: string,
    @Body() input: CreatePetInput,
  ) {
    return this.petService.create(householdId, input);
  }

  @Get(":petId")
  findOne(@Param("petId") petId: string) {
    return this.petService.findOne(petId);
  }

  @Get(":petId/dashboard")
  getDashboard(@Param("petId") petId: string) {
    return this.dashboardService.getDashboard(petId);
  }

  @Patch(":petId")
  update(
    @Param("petId") petId: string,
    @Body() input: UpdatePetInput,
  ) {
    return this.petService.update(petId, input);
  }

  @Delete(":petId")
  remove(@Param("petId") petId: string) {
    return this.petService.remove(petId);
  }
}
