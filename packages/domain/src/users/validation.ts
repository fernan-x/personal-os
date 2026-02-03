import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "./constants.ts";
import type { RegisterUserInput, LoginInput } from "./types.ts";
import type { ValidationError } from "../habits/validation.ts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterUser(
  input: RegisterUserInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.email || input.email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (input.email.length > EMAIL_MAX_LENGTH) {
    errors.push({
      field: "email",
      message: `Email must be at most ${EMAIL_MAX_LENGTH} characters`,
    });
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!input.password || input.password.length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      field: "password",
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.push({
      field: "password",
      message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
    });
  }

  if (input.name !== undefined && input.name.length > NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `Name must be at most ${NAME_MAX_LENGTH} characters`,
    });
  }

  return errors;
}

export function validateLogin(input: LoginInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.email || input.email.trim().length === 0) {
    errors.push({ field: "email", message: "Email is required" });
  }

  if (!input.password || input.password.length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return errors;
}
