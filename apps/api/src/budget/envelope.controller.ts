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
import { EnvelopeService } from "./envelope.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import type { CreateEnvelopeInput, UpdateEnvelopeInput, ImportEnvelopesInput } from "@personal-os/domain";

@Controller("budget/groups/:groupId/plans/:planId/envelopes")
@UseGuards(JwtAuthGuard, BudgetGroupMemberGuard)
export class EnvelopeController {
  constructor(private readonly envelopeService: EnvelopeService) {}

  @Get()
  findAll(@Param("planId") planId: string) {
    return this.envelopeService.findAll(planId);
  }

  @Post()
  create(
    @Param("planId") planId: string,
    @Body() input: CreateEnvelopeInput,
  ) {
    return this.envelopeService.create(planId, input);
  }

  @Post("import")
  importFromPlan(
    @Param("planId") planId: string,
    @Body() input: ImportEnvelopesInput,
  ) {
    return this.envelopeService.importFromPlan(planId, input.sourcePlanId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() input: UpdateEnvelopeInput) {
    return this.envelopeService.update(id, input);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.envelopeService.remove(id);
  }
}
