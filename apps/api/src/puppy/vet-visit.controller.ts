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
import { VetVisitService } from "./vet-visit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type {
  CreateVetVisitInput,
  UpdateVetVisitInput,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/vet-visits")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class VetVisitController {
  constructor(private readonly vetVisitService: VetVisitService) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.vetVisitService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateVetVisitInput,
  ) {
    return this.vetVisitService.create(petId, input);
  }

  @Patch(":visitId")
  update(
    @Param("visitId") visitId: string,
    @Body() input: UpdateVetVisitInput,
  ) {
    return this.vetVisitService.update(visitId, input);
  }

  @Delete(":visitId")
  remove(@Param("visitId") visitId: string) {
    return this.vetVisitService.remove(visitId);
  }
}
