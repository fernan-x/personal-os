import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import type { MealSlot, Prisma } from "@personal-os/database";
import {
  computeDailyTargets,
  distributeTargetsAcrossSlots,
  type MacroTargets,
  type SlotTargets,
  type GenerateMealPlanInput,
} from "@personal-os/domain";

interface CandidateRecipe {
  id: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  servings: number;
  /** Calories for 1 portion (= total calories / servings) */
  perServingCal: number | null;
}

interface Cell {
  date: Date;
  slot: MealSlot;
  dateStr: string;
}

interface PlannedEntry {
  recipeId: string;
  date: Date;
  slot: MealSlot;
  servings: number;
}

export interface GenerateResult {
  planId: string;
  warnings: string[];
}

/** Max servings the algorithm will assign per entry (2x the recipe batch) */
const MAX_SERVINGS_MULTIPLIER = 2;

/** Balancing tolerance — days within this ratio are considered OK */
const BALANCE_TOLERANCE = 0.10;

/** Warning tolerance — days outside this ratio generate a warning */
const WARNING_TOLERANCE = 0.15;

/** Number of balancing iterations */
const BALANCE_ITERATIONS = 3;

/**
 * Compute how many portions to eat at a meal to best match a calorie target.
 * Returns at least 1, at most maxServings.
 */
function optimalServingsForTarget(
  perServingCal: number,
  targetCal: number,
  maxServings: number,
): number {
  const raw = targetCal / perServingCal;
  return Math.max(1, Math.min(maxServings, Math.round(raw)));
}

@Injectable()
export class MealPlanGeneratorService {
  constructor(private readonly db: DatabaseService) {}

  async generate(
    input: GenerateMealPlanInput,
    userId: string,
  ): Promise<GenerateResult> {
    const warnings: string[] = [];

    // ── 1. Fetch user profile ───────────────────────────────────
    const user = await this.db.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        weight: true,
        height: true,
        birthDate: true,
        gender: true,
        activityLevel: true,
        fitnessGoal: true,
      },
    });

    // ── 2. Resolve daily targets ────────────────────────────────
    let dailyTargets: MacroTargets | null = null;

    const profileComplete =
      user.weight != null &&
      user.height != null &&
      user.birthDate != null &&
      user.gender != null &&
      user.activityLevel != null &&
      user.fitnessGoal != null;

    if (input.calorieTarget) {
      dailyTargets = {
        calories: input.calorieTarget,
        protein: Math.round((input.calorieTarget * 0.3) / 4),
        carbs: Math.round((input.calorieTarget * 0.4) / 4),
        fat: Math.round((input.calorieTarget * 0.3) / 9),
      };
    } else if (profileComplete) {
      dailyTargets = computeDailyTargets(
        user.weight!,
        user.height!,
        user.birthDate!,
        user.gender!,
        user.activityLevel!,
        user.fitnessGoal!,
      );
    }

    // ── 3. Slot targets ─────────────────────────────────────────
    const slotTargets = dailyTargets
      ? distributeTargetsAcrossSlots(dailyTargets, input.slots)
      : null;

    const slotTargetMap: Record<string, SlotTargets> | null = slotTargets
      ? Object.fromEntries(slotTargets.map((st) => [st.slot, st]))
      : null;

    // ── 4. Fetch candidate recipes ──────────────────────────────
    const where: Prisma.RecipeWhereInput = {
      OR: [{ userId }, { visibility: "public" }],
    };
    if (input.tagIds && input.tagIds.length > 0) {
      where.tags = { some: { tagId: { in: input.tagIds } } };
    }
    if (input.maxPrepTime != null) {
      where.prepTime = { lte: input.maxPrepTime };
    }

    const rawRecipes = await this.db.recipe.findMany({
      where,
      select: {
        id: true,
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
        servings: true,
      },
    });

    const recipes: CandidateRecipe[] = rawRecipes.map((r) => ({
      ...r,
      perServingCal: r.calories != null ? r.calories / r.servings : null,
    }));

    if (recipes.length === 0) {
      const plan = await this.db.mealPlan.create({
        data: {
          userId,
          name: input.name?.trim() || "Plan auto",
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        },
      });
      warnings.push(
        "Aucune recette trouvee correspondant aux criteres. Le plan est vide.",
      );
      return { planId: plan.id, warnings };
    }

    // Check if any recipe has calorie data
    const recipesWithCal = recipes.filter((r) => r.perServingCal != null);
    if (recipesWithCal.length === 0 && dailyTargets) {
      warnings.push(
        "Aucune recette ne contient de donnees caloriques. Les objectifs nutritionnels ne peuvent pas etre atteints.",
      );
    }

    // ── 5. Build all (date, slot) cells ─────────────────────────
    const cells: Cell[] = [];
    const current = new Date(input.startDate);
    const end = new Date(input.endDate);
    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      for (const slot of input.slots) {
        cells.push({
          date: new Date(current),
          slot: slot as MealSlot,
          dateStr,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    // ── 6. Fill cells independently ─────────────────────────────
    //
    // Each cell picks the best recipe independently based on:
    //   fitScore  = 1 - |actualCal - slotTarget| / slotTarget
    //   varietyPenalty = avoid repeating the same recipe too often
    //
    // Key change: portions are no longer capped at batch size.
    // MAX_SERVINGS_MULTIPLIER * recipe.servings is used instead.

    const entries: PlannedEntry[] = [];
    const recipeUsagePerDay = new Map<string, Map<string, number>>();

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const target = slotTargetMap?.[cell.slot] ?? null;
      const dayUsage =
        recipeUsagePerDay.get(cell.dateStr) ?? new Map<string, number>();

      let bestScore = -Infinity;
      let bestRecipe: CandidateRecipe | null = null;
      let bestServings = 1;

      for (const recipe of recipes) {
        let servingsForCell: number;
        let fitScore: number;

        if (target && recipe.perServingCal != null) {
          // Allow portions up to MAX_SERVINGS_MULTIPLIER * batch size
          const maxServings = recipe.servings * MAX_SERVINGS_MULTIPLIER;
          servingsForCell = optimalServingsForTarget(
            recipe.perServingCal,
            target.calories,
            maxServings,
          );
          const actualCal = recipe.perServingCal * servingsForCell;
          const distance =
            Math.abs(actualCal - target.calories) / target.calories;
          fitScore = 1 - distance;
        } else {
          servingsForCell = 1;
          fitScore = 0;
        }

        // Variety: penalize recipes already used today
        const usedToday = dayUsage.get(recipe.id) ?? 0;
        const varietyPenalty = usedToday * 0.3;
        const score = fitScore - varietyPenalty;

        if (score > bestScore) {
          bestScore = score;
          bestRecipe = recipe;
          bestServings = servingsForCell;
        }
      }

      if (!bestRecipe) {
        bestRecipe = recipes[0];
        bestServings = 1;
      }

      entries.push({
        recipeId: bestRecipe.id,
        date: cell.date,
        slot: cell.slot,
        servings: bestServings,
      });

      dayUsage.set(
        bestRecipe.id,
        (dayUsage.get(bestRecipe.id) ?? 0) + 1,
      );
      recipeUsagePerDay.set(cell.dateStr, dayUsage);
    }

    // ── 7. Multi-iteration balancing pass ────────────────────────
    if (dailyTargets && slotTargetMap) {
      const recipeMap = new Map(recipes.map((r) => [r.id, r]));

      const calForEntry = (e: PlannedEntry) => {
        const r = recipeMap.get(e.recipeId);
        return (r?.perServingCal ?? 0) * e.servings;
      };

      for (let iteration = 0; iteration < BALANCE_ITERATIONS; iteration++) {
        // Group entries by date
        const entriesByDate = new Map<string, PlannedEntry[]>();
        for (const entry of entries) {
          const dateStr = entry.date.toISOString().slice(0, 10);
          const list = entriesByDate.get(dateStr) ?? [];
          list.push(entry);
          entriesByDate.set(dateStr, list);
        }

        for (const [, dayEntries] of entriesByDate) {
          const dayTotal = dayEntries.reduce(
            (sum, e) => sum + calForEntry(e),
            0,
          );
          const gap = dailyTargets.calories - dayTotal;
          if (Math.abs(gap) / dailyTargets.calories <= BALANCE_TOLERANCE)
            continue;

          // Find the slot whose current calories are furthest from its target
          let worstIdx = -1;
          let worstGap = 0;

          for (let k = 0; k < dayEntries.length; k++) {
            const e = dayEntries[k];
            const slotTarget = slotTargetMap[e.slot]?.calories ?? 0;
            const actual = calForEntry(e);
            const slotGap = Math.abs(actual - slotTarget);
            if (slotGap > worstGap) {
              worstGap = slotGap;
              worstIdx = k;
            }
          }

          if (worstIdx < 0) continue;

          const worst = dayEntries[worstIdx];
          const worstRecipe = recipeMap.get(worst.recipeId);
          const currentSlotCal = calForEntry(worst);
          const maxServings = worstRecipe
            ? worstRecipe.servings * MAX_SERVINGS_MULTIPLIER
            : worst.servings;

          // What this slot should provide to close the day's gap
          const idealCal = currentSlotCal + gap;

          if (idealCal > 0 && worstRecipe?.perServingCal) {
            // Try adjusting servings on the current recipe
            const newServings = Math.max(
              1,
              Math.min(
                maxServings,
                Math.round(idealCal / worstRecipe.perServingCal),
              ),
            );
            if (newServings !== worst.servings) {
              worst.servings = newServings;
              continue;
            }
          }

          // Otherwise try swapping to a better recipe
          if (idealCal > 0) {
            let bestSwap: CandidateRecipe | null = null;
            let bestSwapServings = 1;
            let bestDist = Infinity;

            for (const recipe of recipes) {
              if (recipe.perServingCal == null) continue;
              const cap = recipe.servings * MAX_SERVINGS_MULTIPLIER;
              const s = optimalServingsForTarget(
                recipe.perServingCal,
                idealCal,
                cap,
              );
              const dist = Math.abs(recipe.perServingCal * s - idealCal);
              if (dist < bestDist) {
                bestDist = dist;
                bestSwap = recipe;
                bestSwapServings = s;
              }
            }

            if (bestSwap && bestDist < worstGap) {
              worst.recipeId = bestSwap.id;
              worst.servings = bestSwapServings;
            }
          }
        }
      }
    }

    // ── 8. Snack insertion fallback ──────────────────────────────
    // For each day still >10% below daily target, insert or boost a snack
    if (dailyTargets && slotTargetMap) {
      const recipeMap = new Map(recipes.map((r) => [r.id, r]));

      const calForEntry = (e: PlannedEntry) => {
        const r = recipeMap.get(e.recipeId);
        return (r?.perServingCal ?? 0) * e.servings;
      };

      // Group entries by date
      const entriesByDate = new Map<string, PlannedEntry[]>();
      for (const entry of entries) {
        const dateStr = entry.date.toISOString().slice(0, 10);
        const list = entriesByDate.get(dateStr) ?? [];
        list.push(entry);
        entriesByDate.set(dateStr, list);
      }

      for (const [dateStr, dayEntries] of entriesByDate) {
        const dayTotal = dayEntries.reduce(
          (sum, e) => sum + calForEntry(e),
          0,
        );
        const gap = dailyTargets.calories - dayTotal;
        if (gap / dailyTargets.calories <= BALANCE_TOLERANCE) continue;

        // Find best recipe to fill the gap
        const recipesWithCalData = recipes.filter(
          (r) => r.perServingCal != null,
        );
        if (recipesWithCalData.length === 0) continue;

        let bestRecipe: CandidateRecipe | null = null;
        let bestServings = 1;
        let bestDist = Infinity;

        for (const recipe of recipesWithCalData) {
          const cap = recipe.servings * MAX_SERVINGS_MULTIPLIER;
          const s = optimalServingsForTarget(
            recipe.perServingCal!,
            gap,
            cap,
          );
          const dist = Math.abs(recipe.perServingCal! * s - gap);
          if (dist < bestDist) {
            bestDist = dist;
            bestRecipe = recipe;
            bestServings = s;
          }
        }

        if (!bestRecipe) continue;

        // Check if snack already exists for this day
        const existingSnack = dayEntries.find((e) => e.slot === "snack");

        if (existingSnack) {
          // Increase snack servings
          const snackRecipe = recipeMap.get(existingSnack.recipeId);
          if (snackRecipe?.perServingCal) {
            const additionalServings = Math.max(
              1,
              Math.round(gap / snackRecipe.perServingCal),
            );
            existingSnack.servings += additionalServings;
          }
        } else {
          // Insert a new snack entry
          const dateObj = dayEntries[0].date;
          entries.push({
            recipeId: bestRecipe.id,
            date: dateObj,
            slot: "snack" as MealSlot,
            servings: bestServings,
          });
        }
      }
    }

    // ── 9. Create plan + entries in transaction ─────────────────
    const plan = await this.db.$transaction(async (tx) => {
      return tx.mealPlan.create({
        data: {
          userId,
          name: input.name?.trim() || "Plan auto",
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          entries: {
            create: entries.map((e) => ({
              recipeId: e.recipeId,
              date: e.date,
              slot: e.slot,
              servings: e.servings,
            })),
          },
        },
      });
    });

    // ── 10. Compute warnings for days off-target ────────────────
    if (dailyTargets) {
      const recipeMap = new Map(recipes.map((r) => [r.id, r]));
      const entriesByDate = new Map<string, PlannedEntry[]>();
      for (const entry of entries) {
        const dateStr = entry.date.toISOString().slice(0, 10);
        const list = entriesByDate.get(dateStr) ?? [];
        list.push(entry);
        entriesByDate.set(dateStr, list);
      }

      for (const [dateStr, dayEntries] of entriesByDate) {
        const dayTotal = dayEntries.reduce((sum, e) => {
          const r = recipeMap.get(e.recipeId);
          return sum + (r?.perServingCal ?? 0) * e.servings;
        }, 0);

        const ratio = Math.abs(dailyTargets.calories - dayTotal) / dailyTargets.calories;
        if (ratio > WARNING_TOLERANCE) {
          warnings.push(
            `Les recettes disponibles ne permettent pas d'atteindre l'objectif de ${dailyTargets.calories} kcal pour le ${dateStr}. Total atteint : ${Math.round(dayTotal)} kcal.`,
          );
        }
      }
    }

    return { planId: plan.id, warnings };
  }
}
