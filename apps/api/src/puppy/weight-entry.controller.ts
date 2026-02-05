import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { WeightEntryService } from "./weight-entry.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type { CreateWeightEntryInput } from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/weights")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class WeightEntryController {
  constructor(private readonly weightEntryService: WeightEntryService) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.weightEntryService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateWeightEntryInput,
  ) {
    return this.weightEntryService.create(petId, input);
  }

  @Delete(":entryId")
  remove(@Param("entryId") entryId: string) {
    return this.weightEntryService.remove(entryId);
  }
}
