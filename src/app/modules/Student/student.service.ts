import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { IUser } from "./student.interface";
import { Prisma, UserRole } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { subDays } from "date-fns";

const registration = async (userData: IUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: userData?.email,
    },
  });

  if (isUserExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Student already exists");
  }

  const hashedPassword: string = await bcrypt.hash(userData?.password, 12);

  const randomId = `${userData.firstName.charAt(0)}${userData.lastName.charAt(
    0
  )}${Math.floor(Math.random() * 100000000)}`;

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const newUser = await prisma.user.create({
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: hashedPassword,
      role: UserRole.STUDENT,
      otp: randomOtp,
      otpExpiresAt: otpExpiry,
    },
  });

  const html = otpEmail(randomOtp);

  await emailSender("OTP", userData.email, html);

  return {
    id: newUser.id,
    email: newUser.email,
    message: "OTP sent! Please verify your email to complete registration.",
  };
};

const createUpdateProfile = async (profileData: any) => {
  const profile = await prisma.studentProfile.upsert({
    where: { userId: profileData.userId },
    update: {
      profileImage: profileData.profileImage,
      gurdianContact: profileData.gurdianContact,
      academicInformation: profileData.academicInformation,
      experience: profileData.experience,
      hobbies: profileData.hobbies,
      skill: profileData.skill,
      socialProfile: profileData.socialProfile,
    },
    create: {
      userId: profileData.userId,
      profileImage: profileData.profileImage,
      gurdianContact: profileData.gurdianContact,
      academicInformation: profileData.academicInformation,
      experience: profileData.experience,
      hobbies: profileData.hobbies,
      skill: profileData.skill,
      socialProfile: profileData.socialProfile,
    },
  });

  return {
    profile,
  };
};

const getStudentProfile = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
  }

  return {
    profile,
  };
};

const getStudentById = async (userId: string) => {
  const profile = await prisma.studentProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
  }

  return {
    profile,
  };
};

const getAllStudents = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["gurdianContact", "academicInformation"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.StudentProfileWhereInput = {
    AND: [...andConditions],
  };

  const profile = await prisma.studentProfile.findMany({
    where: {
      ...whereConditions,
    },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.studentProfile.count({
    where: {
      ...whereConditions,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: profile,
  };
};

const studentDetails = async () => {
  const studentProgress = await prisma.$transaction(async (TX) => {
    const sevenDaysAgo = subDays(new Date(), 7);

    const student = await TX.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    });

    const totalCourse = await prisma.subject.count();

    const newEnroll = await TX.user.count({
      where: {
        role: UserRole.STUDENT,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const correctQuiz = await TX.stepEightQuizAttempt.count({
      where: {
        isCorrect: true,
      },
    });

    const attentQuiz = await TX.stepEightQuizAttempt.count({});

    const correctAnswer = (correctQuiz / attentQuiz) * 100;

    return {
      student,
      totalCourse,
      newEnroll,
      correctAnswer,
    };
  });

  return studentProgress;
};

const overalGraph = async (fromDateStr: string) => {
  const fromDate = new Date(fromDateStr);

  const overalProgress = await prisma.$transaction(async (TX) => {
    const student = await TX.user.count({
      where: {
        role: UserRole.STUDENT,
        createdAt: {
          gte: fromDate,
        },
      },
    });

    const correctQuiz = await TX.stepEightQuizAttempt.count({
      where: {
        isCorrect: true,
        createdAt: {
          gte: fromDate,
        },
      },
    });

    const wrongQuiz = await TX.stepEightQuizAttempt.count({
      where: {
        isCorrect: false,
        createdAt: {
          gte: fromDate,
        },
      },
    });

    return {
      student,
      correctQuiz,
      wrongQuiz,
    };
  });

  return overalProgress;
};

// const participation = async () => {
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//   const participate = await prisma.stepEightQuizAttempt.count({
//     where: {
//       createdAt: {
//         gte: sevenDaysAgo,
//       },
//     },
//   });

//   return {
//     participate,
//   };
// };

const participation = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const attempts = await prisma.stepEightQuizAttempt.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;
  type DayName = (typeof dayNames)[number];

  const counts: Record<DayName, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  attempts.forEach(({ createdAt }) => {
    const day = new Date(createdAt).getDay();
    const dayName = dayNames[day];
    counts[dayName]++;
  });

  return counts;
};

export const StudentService = {
  registration,
  createUpdateProfile,
  getStudentProfile,
  getStudentById,
  getAllStudents,
  studentDetails,
  overalGraph,
  participation,
};
