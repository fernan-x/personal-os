import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { EnvelopeEntryService } from "./envelope-entry.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BudgetGroupMemberGuard } from "./guards/budget-group-member.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type {
  CreateEnvelopeEntryInput,
  AuthenticatedUser,
} from "@personal-os/domain";

@Controller("budget/groups/:groupId/plans/:planId/envelopes/:envelopeId/entries")
@UseGuards(JwtAuthGuard, BudgetGroupMemberGuard)
export class EnvelopeEntryController {
  constructor(private readonly envelopeEntryService: EnvelopeEntryService) {}

  @Get()
  findAll(@Param("envelopeId") envelopeId: string) {
    return this.envelopeEntryService.findAll(envelopeId);
  }

  @Post()
  create(
    @Param("envelopeId") envelopeId: string,
    @Body() input: CreateEnvelopeEntryInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.envelopeEntryService.create(envelopeId, user.id, input);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.envelopeEntryService.remove(id, user.id);
  }
}
