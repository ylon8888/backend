import { StepType } from "@prisma/client";

export interface ICourseProgress {
  userId: string;
  chapterId: string;
  stepId: string;
  stepSerial: string;
}

export interface IStepProgress {
  userId: string;
  chapterId: string;
  stepId: string;
  stepSerial: string;
}
