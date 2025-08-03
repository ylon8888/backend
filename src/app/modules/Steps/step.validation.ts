import { z } from "zod";

export const quizRowSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["OptionA", "OptionB", "OptionC", "OptionD"], {
    required_error:
      "Correct answer must be OptionA, OptionB, OptionC, or OptionD",
  }),
});

export const quizValidationSchema = z.object({
  quiz: z.array(quizRowSchema).min(1, "At least one quiz question is required"),
});
