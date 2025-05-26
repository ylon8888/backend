import { z } from "zod";

const parseJSON = (val: unknown) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (error) {
      return {
        __parseError: {
          message: `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`,
          originalValue: val
        }
      };
    }
  }
  return val || [];
};

const jsonArrayValidator = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([
    schema,
    z.object({
      __parseError: z.object({
        message: z.string(),
        originalValue: z.unknown()
      })
    })
  ]).refine(
    (data) => !('__parseError' in data),
    (data) => ({
      message: (data as any).__parseError.message,
      path: []
    })
  );

const guardianContactSchema = z.array(z.object({
  gurdianName: z.string().min(1, "Guardian name is required"),
  gurdianNumber: z.string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits")
})).min(1, "At least one guardian contact is required");

const academicInfoSchema = z.array(z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  courseName: z.string().min(1, "Course name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})).min(1, "Academic information is required");

const experienceSchema = z.array(z.object({
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})).min(1, "At least one experience entry is required");

const hobbySchema = z.array(z.object({
  name: z.string().min(1, "Hobby name is required")
})).min(1, "At least one hobby is required");

const skillSchema = z.array(z.object({
  skillName: z.string().min(1, "Skill name is required")
})).min(1, "At least one skill is required");

const socialProfileSchema = z.array(z.object({
  socialMedia: z.string().min(1, "Social media platform is required"),
  socialLink: z.string().url("Invalid URL format")
})).min(1, "At least one social profile is required");

export const createProfileSchema = z.object({
  body: z.object({
    gurdianContact: z.preprocess(parseJSON, jsonArrayValidator(guardianContactSchema)),
    academicInformation: z.preprocess(parseJSON, jsonArrayValidator(academicInfoSchema)),
    experience: z.preprocess(parseJSON, jsonArrayValidator(experienceSchema)),
    hobbies: z.preprocess(parseJSON, jsonArrayValidator(hobbySchema)),
    skill: z.preprocess(parseJSON, jsonArrayValidator(skillSchema)),
    socialProfile: z.preprocess(parseJSON, jsonArrayValidator(socialProfileSchema))
  })
});

export type CreateProfileInput = z.TypeOf<typeof createProfileSchema>;