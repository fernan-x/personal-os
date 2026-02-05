import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";

@Injectable()
export class HouseholdMemberGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const householdId = request.params.householdId;

    if (!userId || !householdId) {
      throw new ForbiddenException("Access denied");
    }

    const membership = await this.db.householdMember.findUnique({
      where: { userId_householdId: { userId, householdId } },
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this household");
    }

    return true;
  }
}
