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
import { RoutineTemplateService } from "./routine-template.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdMemberGuard } from "./guards/household-member.guard";
import type {
  CreateRoutineTemplateInput,
  UpdateRoutineTemplateInput,
} from "@personal-os/domain";

@Controller("puppy/households/:householdId/pets/:petId/routines")
@UseGuards(JwtAuthGuard, HouseholdMemberGuard)
export class RoutineTemplateController {
  constructor(private readonly routineTemplateService: RoutineTemplateService) {}

  @Get()
  findAll(@Param("petId") petId: string) {
    return this.routineTemplateService.findAll(petId);
  }

  @Post()
  create(
    @Param("petId") petId: string,
    @Body() input: CreateRoutineTemplateInput,
  ) {
    return this.routineTemplateService.create(petId, input);
  }

  @Post("reorder")
  reorder(
    @Param("petId") petId: string,
    @Body() body: { templateIds: string[] },
  ) {
    return this.routineTemplateService.reorder(petId, body.templateIds);
  }

  @Patch(":templateId")
  update(
    @Param("templateId") templateId: string,
    @Body() input: UpdateRoutineTemplateInput,
  ) {
    return this.routineTemplateService.update(templateId, input);
  }

  @Delete(":templateId")
  remove(@Param("templateId") templateId: string) {
    return this.routineTemplateService.remove(templateId);
  }
}
