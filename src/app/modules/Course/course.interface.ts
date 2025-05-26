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

export interface ICourse {
  name: string;
  phoneNumber: string;
  userId: string;
  subjectId: string;
}
