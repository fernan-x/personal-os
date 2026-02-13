export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  ssoProvider: string | null;
  enabledModules: string[];
}

export interface UpdateProfileInput {
  name?: string;
}

export interface UpdateModulesInput {
  enabledModules: string[];
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
}
