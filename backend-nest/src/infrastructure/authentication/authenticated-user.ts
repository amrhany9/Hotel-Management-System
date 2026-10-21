export interface AuthenticatedUser {
  userId: number;
  email: string;
  fullName: string;
}

export interface JwtPayload {
  sub: string;
  nameid?: string;
  email?: string | string[];
  unique_name?: string;
  jti?: string;
  exp?: number;
  iss?: string;
  aud?: string | string[];
}
