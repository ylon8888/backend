import { StepType } from "@prisma/client";

export interface ICourseProgress {
  userId: string;
  chapterId: string;
  stepId: string;
  stepSerial: string;
}

export interface INextStepProgress {
  userId: string;
  chapterId: string;
  stepSerial: string;
}

