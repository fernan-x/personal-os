export type { User } from "@personal-os/database";
export type {
  RegisterUserInput,
  LoginInput,
  AuthenticatedUser,
  AuthTokenPayload,
  AuthResponse,
  UpdateProfileInput,
  UpdateModulesInput,
} from "./types.ts";
export {
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MAX_LENGTH,
  JWT_EXPIRATION,
  SSO_PROVIDER_AUTHENTIK,
} from "./constants.ts";
export {
  validateRegisterUser,
  validateLogin,
  validateUpdateProfile,
  validateUpdateModules,
} from "./validation.ts";
