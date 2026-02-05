import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  computePetAge,
  computeGrowthStage,
  computeTrainingProgress,
} from "@personal-os/domain";

@Injectable()
export class PetDashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard(petId: string) {
    const pet = await this.db.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException("Pet not found");
    }

    const today = new Date(new Date().toISOString().split("T")[0]);

    const [
      latestWeight,
      trainingMilestones,
      upcomingVaccinations,
      upcomingVetVisits,
      activeMedications,
      todayChecklist,
      lastWalk,
      lastMeal,
    ] = await Promise.all([
      this.db.weightEntry.findFirst({
        where: { petId },
        orderBy: { date: "desc" },
      }),
      this.db.trainingMilestone.findMany({
        where: { petId },
      }),
      this.db.vaccination.findMany({
        where: {
          petId,
          nextDueDate: { gte: today },
        },
        orderBy: { nextDueDate: "asc" },
        take: 3,
      }),
      this.db.vetVisit.findMany({
        where: {
          petId,
          nextVisitDate: { gte: today },
        },
        orderBy: { nextVisitDate: "asc" },
        take: 3,
      }),
      this.db.medication.findMany({
        where: {
          petId,
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
      }),
      this.db.dailyChecklistItem.findMany({
        where: { petId, date: today },
        include: { template: true },
      }),
      this.db.activityLog.findFirst({
        where: { petId, type: "walk" },
        orderBy: { loggedAt: "desc" },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.db.activityLog.findFirst({
        where: { petId, type: "meal" },
        orderBy: { loggedAt: "desc" },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
    ]);

    const trainingProgress = computeTrainingProgress(trainingMilestones);
    const checklistCompleted = todayChecklist.filter((i) => i.completed).length;
    const checklistTotal = todayChecklist.length;

    return {
      pet: {
        ...pet,
        age: computePetAge(pet.birthDate),
        growthStage: computeGrowthStage(pet.birthDate),
      },
      latestWeight,
      trainingProgress,
      upcomingReminders: [
        ...upcomingVaccinations.map((v) => ({
          type: "vaccination" as const,
          name: v.name,
          date: v.nextDueDate,
        })),
        ...upcomingVetVisits.map((v) => ({
          type: "vet" as const,
          name: v.reason,
          date: v.nextVisitDate,
        })),
      ].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
      activeMedications,
      todayChecklist: {
        completed: checklistCompleted,
        total: checklistTotal,
      },
      lastActivity: {
        walk: lastWalk,
        meal: lastMeal,
      },
    };
  }
}
