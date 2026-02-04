import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateEnvelopeEntry } from "@personal-os/domain";
import type { CreateEnvelopeEntryInput } from "@personal-os/domain";

@Injectable()
export class EnvelopeEntryService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(envelopeId: string) {
    return this.db.envelopeEntry.findMany({
      where: { envelopeId },
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { date: "desc" },
    });
  }

  async create(envelopeId: string, userId: string, input: CreateEnvelopeEntryInput) {
    const errors = validateCreateEnvelopeEntry(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const envelope = await this.db.envelope.findUnique({ where: { id: envelopeId } });
    if (!envelope) {
      throw new NotFoundException("Envelope not found");
    }

    const date = new Date(input.date);
    date.setUTCHours(0, 0, 0, 0);

    return this.db.envelopeEntry.create({
      data: {
        envelopeId,
        userId,
        amount: input.amount,
        note: input.note?.trim(),
        date,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const entry = await this.db.envelopeEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException("Entry not found");
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException("You can only delete your own entries");
    }

    await this.db.envelopeEntry.delete({ where: { id } });
    return { deleted: true };
  }
}
