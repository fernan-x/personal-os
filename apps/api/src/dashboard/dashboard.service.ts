import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  validateCreateDashboardWidget,
  validateSetDashboard,
  validateWidgetConfig,
  isValidWidgetType,
  MAX_DASHBOARD_WIDGETS,
} from "@personal-os/domain";
import type {
  CreateDashboardWidgetInput,
  UpdateDashboardWidgetInput,
  SetDashboardInput,
} from "@personal-os/domain";
import type { Prisma } from "@personal-os/database";

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getUserWidgets(userId: string) {
    return this.db.dashboardWidget.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    });
  }

  async addWidget(input: CreateDashboardWidgetInput, userId: string) {
    const errors = validateCreateDashboardWidget(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const count = await this.db.dashboardWidget.count({ where: { userId } });
    if (count >= MAX_DASHBOARD_WIDGETS) {
      throw new BadRequestException(
        `Maximum ${MAX_DASHBOARD_WIDGETS} widgets allowed`,
      );
    }

    return this.db.dashboardWidget.create({
      data: {
        userId,
        type: input.type,
        position: count,
        config: (input.config ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async updateWidget(
    id: string,
    input: UpdateDashboardWidgetInput,
    userId: string,
  ) {
    const widget = await this.db.dashboardWidget.findUnique({ where: { id } });
    if (!widget) {
      throw new NotFoundException("Widget not found");
    }
    if (widget.userId !== userId) {
      throw new ForbiddenException();
    }

    if (input.config && isValidWidgetType(widget.type)) {
      const errors = validateWidgetConfig(widget.type, input.config);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    }

    return this.db.dashboardWidget.update({
      where: { id },
      data: {
        ...(input.config !== undefined && {
          config: input.config as Prisma.InputJsonValue,
        }),
      },
    });
  }

  async removeWidget(id: string, userId: string) {
    const widget = await this.db.dashboardWidget.findUnique({ where: { id } });
    if (!widget) {
      throw new NotFoundException("Widget not found");
    }
    if (widget.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.db.dashboardWidget.delete({ where: { id } });

    // Re-index remaining widgets
    const remaining = await this.db.dashboardWidget.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    });
    await Promise.all(
      remaining.map((w, i) =>
        this.db.dashboardWidget.update({
          where: { id: w.id },
          data: { position: i },
        }),
      ),
    );

    return { deleted: true };
  }

  async setDashboard(input: SetDashboardInput, userId: string) {
    const errors = validateSetDashboard(input);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.db.$transaction(async (tx) => {
      await tx.dashboardWidget.deleteMany({ where: { userId } });

      const widgets = await Promise.all(
        input.widgets.map((w, i) =>
          tx.dashboardWidget.create({
            data: {
              userId,
              type: w.type,
              position: i,
              config: (w.config ?? {}) as Prisma.InputJsonValue,
            },
          }),
        ),
      );

      return widgets;
    });
  }
}
