import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export class BudgetGroupMemberGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const groupId = request.params.groupId;

    if (!userId || !groupId) {
      throw new ForbiddenException("Access denied");
    }

    const membership = await this.db.budgetMembership.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this budget group");
    }

    return true;
  }
}
