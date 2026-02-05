import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { validateCreateActivityLog } from "@personal-os/domain";
import type { CreateActivityLogInput, ActivityType } from "@personal-os/domain";

@Injectable()
export class ActivityLogService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    petId: string,
    filters?: {
      type?: ActivityType;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.db.activityLog.findMany({
      where: {
        petId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            loggedAt: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate + "T23:59:59.999Z"),
            },
          }),
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { loggedAt: "desc" },
    });
  }

  async create(petId: string, userId: string, input: CreateActivityLogInput) {
    const errors = validateCreateActivityLog(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.activityLog.create({
      data: {
        petId,
        userId,
        type: input.type,
        duration: input.duration ?? null,
        note: input.note ?? null,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const log = await this.db.activityLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException("Activity log not found");
    }
    await this.db.activityLog.delete({ where: { id } });
    return { deleted: true };
  }

  async getLastByType(petId: string, type: ActivityType) {
    return this.db.activityLog.findFirst({
      where: { petId, type },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { loggedAt: "desc" },
    });
  }
}
