import type { ValidationError } from "../common/index.ts";
import type {
  CreateBudgetGroupInput,
  UpdateBudgetGroupInput,
  AddGroupMemberInput,
  CreateExpenseCategoryInput,
  CreateMonthlyPlanInput,
  CreateIncomeInput,
  UpdateIncomeInput,
  CreatePlannedExpenseInput,
  UpdatePlannedExpenseInput,
  UpdateExpenseStatusInput,
  CreateSharedExpenseInput,
  CreateEnvelopeInput,
  UpdateEnvelopeInput,
  CreateEnvelopeEntryInput,
} from "./types.ts";
import {
  GROUP_NAME_MAX_LENGTH,
  INCOME_SOURCE_MAX_LENGTH,
  EXPENSE_NAME_MAX_LENGTH,
  ENVELOPE_NOTE_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_ICON_MAX_LENGTH,
  EXPENSE_SCOPES,
  EXPENSE_RECURRENCES,
  EXPENSE_STATUSES,
  BASIS_POINTS_TOTAL,
} from "./constants.ts";

// ── Budget Group ────────────────────────────────────────────────

export function validateCreateBudgetGroup(
  input: CreateBudgetGroupInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > GROUP_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${GROUP_NAME_MAX_LENGTH} characters`,
    });
  }

  return errors;
}

export function validateUpdateBudgetGroup(
  input: UpdateBudgetGroupInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (input.name.length > GROUP_NAME_MAX_LENGTH) {
      errors.push({
        field: "name",
        message: `Name must be at most ${GROUP_NAME_MAX_LENGTH} characters`,
      });
    }
  }

  return errors;
}

export function validateAddGroupMember(
  input: AddGroupMemberInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.email || input.email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  return errors;
}

// ── Expense Category ────────────────────────────────────────────

export function validateCreateExpenseCategory(
  input: CreateExpenseCategoryInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > CATEGORY_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
    });
  }

  if (input.icon !== undefined && input.icon.length > CATEGORY_ICON_MAX_LENGTH) {
    errors.push({
      field: "icon",
      message: `Icon must be at most ${CATEGORY_ICON_MAX_LENGTH} characters`,
    });
  }

  return errors;
}

// ── Monthly Plan ────────────────────────────────────────────────

export function validateCreateMonthlyPlan(
  input: CreateMonthlyPlanInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.month === undefined || input.month === null) {
    errors.push({ field: "month", message: "Month is required" });
  } else if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    errors.push({ field: "month", message: "Month must be between 1 and 12" });
  }

  if (input.year === undefined || input.year === null) {
    errors.push({ field: "year", message: "Year is required" });
  } else if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) {
    errors.push({ field: "year", message: "Year must be between 2000 and 2100" });
  }

  return errors;
}

// ── Income ──────────────────────────────────────────────────────

export function validateCreateIncome(
  input: CreateIncomeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.source || input.source.trim().length === 0) {
    errors.push({ field: "source", message: "Source is required" });
  } else if (input.source.length > INCOME_SOURCE_MAX_LENGTH) {
    errors.push({
      field: "source",
      message: `Source must be at most ${INCOME_SOURCE_MAX_LENGTH} characters`,
    });
  }

  if (input.amount === undefined || input.amount === null) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else if (!Number.isInteger(input.amount) || input.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
  }

  return errors;
}

export function validateUpdateIncome(
  input: UpdateIncomeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.source !== undefined) {
    if (!input.source || input.source.trim().length === 0) {
      errors.push({ field: "source", message: "Source is required" });
    } else if (input.source.length > INCOME_SOURCE_MAX_LENGTH) {
      errors.push({
        field: "source",
        message: `Source must be at most ${INCOME_SOURCE_MAX_LENGTH} characters`,
      });
    }
  }

  if (input.amount !== undefined) {
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
    }
  }

  return errors;
}

// ── Planned Expense ─────────────────────────────────────────────

export function validateCreatePlannedExpense(
  input: CreatePlannedExpenseInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > EXPENSE_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${EXPENSE_NAME_MAX_LENGTH} characters`,
    });
  }

  if (input.amount === undefined || input.amount === null) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else if (!Number.isInteger(input.amount) || input.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
  }

  if (
    input.scope !== undefined &&
    !(EXPENSE_SCOPES as readonly string[]).includes(input.scope)
  ) {
    errors.push({
      field: "scope",
      message: `Scope must be one of: ${EXPENSE_SCOPES.join(", ")}`,
    });
  }

  if (
    input.recurrence !== undefined &&
    !(EXPENSE_RECURRENCES as readonly string[]).includes(input.recurrence)
  ) {
    errors.push({
      field: "recurrence",
      message: `Recurrence must be one of: ${EXPENSE_RECURRENCES.join(", ")}`,
    });
  }

  return errors;
}

export function validateUpdatePlannedExpense(
  input: UpdatePlannedExpenseInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length === 0) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (input.name.length > EXPENSE_NAME_MAX_LENGTH) {
      errors.push({
        field: "name",
        message: `Name must be at most ${EXPENSE_NAME_MAX_LENGTH} characters`,
      });
    }
  }

  if (input.amount !== undefined) {
    if (!Number.isInteger(input.amount) || input.amount <= 0) {
      errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
    }
  }

  if (
    input.scope !== undefined &&
    !(EXPENSE_SCOPES as readonly string[]).includes(input.scope)
  ) {
    errors.push({
      field: "scope",
      message: `Scope must be one of: ${EXPENSE_SCOPES.join(", ")}`,
    });
  }

  if (
    input.recurrence !== undefined &&
    !(EXPENSE_RECURRENCES as readonly string[]).includes(input.recurrence)
  ) {
    errors.push({
      field: "recurrence",
      message: `Recurrence must be one of: ${EXPENSE_RECURRENCES.join(", ")}`,
    });
  }

  return errors;
}

export function validateUpdateExpenseStatus(
  input: UpdateExpenseStatusInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.status) {
    errors.push({ field: "status", message: "Status is required" });
  } else if (!(EXPENSE_STATUSES as readonly string[]).includes(input.status)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${EXPENSE_STATUSES.join(", ")}`,
    });
  }

  return errors;
}

export function validateCreateSharedExpense(
  input: CreateSharedExpenseInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (input.name.length > EXPENSE_NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${EXPENSE_NAME_MAX_LENGTH} characters`,
    });
  }

  if (input.amount === undefined || input.amount === null) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else if (!Number.isInteger(input.amount) || input.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
  }

  if (!input.shares || input.shares.length === 0) {
    errors.push({ field: "shares", message: "At least one share is required" });
  } else {
    const totalPercentage = input.shares.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage !== BASIS_POINTS_TOTAL) {
      errors.push({
        field: "shares",
        message: `Share percentages must sum to ${BASIS_POINTS_TOTAL} (basis points)`,
      });
    }

    for (const share of input.shares) {
      if (share.percentage < 0 || share.percentage > BASIS_POINTS_TOTAL) {
        errors.push({
          field: "shares",
          message: `Each share percentage must be between 0 and ${BASIS_POINTS_TOTAL}`,
        });
        break;
      }
    }
  }

  return errors;
}

// ── Envelope ────────────────────────────────────────────────────

export function validateCreateEnvelope(
  input: CreateEnvelopeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.categoryId || input.categoryId.trim().length === 0) {
    errors.push({ field: "categoryId", message: "Category is required" });
  }

  if (input.allocatedAmount === undefined || input.allocatedAmount === null) {
    errors.push({ field: "allocatedAmount", message: "Allocated amount is required" });
  } else if (!Number.isInteger(input.allocatedAmount) || input.allocatedAmount < 0) {
    errors.push({ field: "allocatedAmount", message: "Allocated amount must be a non-negative integer (cents)" });
  }

  return errors;
}

export function validateUpdateEnvelope(
  input: UpdateEnvelopeInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.allocatedAmount !== undefined) {
    if (!Number.isInteger(input.allocatedAmount) || input.allocatedAmount < 0) {
      errors.push({ field: "allocatedAmount", message: "Allocated amount must be a non-negative integer (cents)" });
    }
  }

  return errors;
}

// ── Envelope Entry ──────────────────────────────────────────────

export function validateCreateEnvelopeEntry(
  input: CreateEnvelopeEntryInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.amount === undefined || input.amount === null) {
    errors.push({ field: "amount", message: "Amount is required" });
  } else if (!Number.isInteger(input.amount) || input.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be a positive integer (cents)" });
  }

  if (!input.date) {
    errors.push({ field: "date", message: "Date is required" });
  }

  if (input.note !== undefined && input.note.length > ENVELOPE_NOTE_MAX_LENGTH) {
    errors.push({
      field: "note",
      message: `Note must be at most ${ENVELOPE_NOTE_MAX_LENGTH} characters`,
    });
  }

  return errors;
}
