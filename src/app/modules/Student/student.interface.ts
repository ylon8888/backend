export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole.STUDENT;
}
