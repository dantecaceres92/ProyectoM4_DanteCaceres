export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Credentials {
  email: string;
  password: string;
}
