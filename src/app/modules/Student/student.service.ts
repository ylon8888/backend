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
  const profile = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      studentProfiles: {},
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

  const whereConditions: Prisma.UserWhereInput = {
    AND: [...andConditions, { role: UserRole.STUDENT }],
  };

  const profile = await prisma.user.findMany({
    where: {
      ...whereConditions,
    },
    skip,
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      _count: {
        select: {
          courseEnrolls: true,
        },
      },
      // studentProfiles:{
      //   select:{

      //   }
      // }

      // courseEnrolls: {
      //   select: {
      //     createdAt: true,
      //     phoneNumber: true,
      //     subject: {
      //       select: {
      //         subjectName: true,
      //         class: {
      //           select: {
      //             className: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.user.count({
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

const overalGraph = async (period: string) => {
  let date: Date;

  // Calculate date based on period
  switch (period) {
    case "7days":
      date = subDays(new Date(), 7);
      break;
    case "30days":
      date = subDays(new Date(), 30);
      break;
    case "90days":
      date = subDays(new Date(), 90);
      break;
    case "365days":
      date = subDays(new Date(), 365);
      break;
    default:
      date = subDays(new Date(), 7);
  }

  const overalProgress = await prisma.$transaction(async (TX) => {
    const student = await TX.user.count({
      where: {
        role: UserRole.STUDENT,
        createdAt: {
          gte: date,
        },
      },
    });

    const correctQuiz = await TX.stepEightQuizAttempt.count({
      where: {
        isCorrect: true,
        createdAt: {
          gte: date,
        },
      },
    });

    const wrongQuiz = await TX.stepEightQuizAttempt.count({
      where: {
        isCorrect: false,
        createdAt: {
          gte: date,
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

const participation = async (period: string) => {
  // Determine start date based on period
  let startDate: Date;
  const now = new Date();

  if (period === "Monthly") {
    // last 7 days
    startDate = new Date();
    startDate.setDate(now.getDate() - 6);
  } else if (period === "Yearly") {
    // last 12 months, start from beginning of month 11 months ago
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else if (period === "Quarterly") {
    // last 4 quarters (each 3 months), start from beginning of quarter 3 quarters ago
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startQuarterMonth = (currentQuarter - 3) * 3;
    startDate = new Date(now.getFullYear(), startQuarterMonth, 1);
  } else {
    throw new Error("Invalid period");
  }

  // Fetch all attempts from startDate
  const attempts = await prisma.stepEightQuizAttempt.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  if (period === "Monthly") {
    // Aggregate by day name for last 7 days
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ] as const;

    // Initialize counts with 0
    const counts: Record<string, number> = {};
    // We want counts for the last 7 days specifically by day name + date (to distinguish repeating days)
    // But you requested just day names, so will sum all attempts by day name in the last 7 days

    dayNames.forEach((day) => (counts[day] = 0));

    attempts.forEach(({ createdAt }) => {
      const dayIndex = new Date(createdAt).getDay();
      const dayName = dayNames[dayIndex];
      counts[dayName]++;
    });

    return counts;
  } else if (period === "Yearly") {
    // Aggregate by month names for last 12 months
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Initialize counts for last 12 months only (from startDate)
    const counts: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      // calculate month/year labels
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      const monthName = monthNames[date.getMonth()];
      counts[monthName] = 0;
    }

    attempts.forEach(({ createdAt }) => {
      const date = new Date(createdAt);
      const monthName = monthNames[date.getMonth()];
      // count only if in range (safety)
      if (date >= startDate) {
        counts[monthName] = (counts[monthName] || 0) + 1;
      }
    });

    return counts;
  } else if (period === "Quarterly") {
    // Aggregate by quarters for last 4 quarters

    // Define quarter labels for the last 4 quarters
    // For example: "Jan-Apr", "May-Aug", "Sep-Dec", "Jan-Apr" (rolling)
    // But months don't align exactly to quarters, quarters are usually 3 months: Q1 (Jan-Mar), Q2 (Apr-Jun), etc.
    // You wrote jan-april, may-august, etc. Let's use 4-month quarters as example:
    // Q1: Jan-Apr, Q2: May-Aug, Q3: Sep-Dec

    // Let's define 4 quarters (each 4 months) backward from current date
    // We'll do 3 months quarters (standard) instead:
    // Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
    // Let's build last 4 quarters labels with year, e.g. "Q1 2024"

    const quartersLabels: string[] = [];
    const counts: Record<string, number> = {};

    // Helper to get quarter number from month
    function getQuarter(month: number) {
      return Math.floor(month / 3) + 1;
    }

    // Build last 4 quarters labels with year
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
      const quarter = getQuarter(d.getMonth());
      const label = `Q${quarter} ${d.getFullYear()}`;
      quartersLabels.push(label);
      counts[label] = 0;
    }

    attempts.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      const quarter = getQuarter(d.getMonth());
      const label = `Q${quarter} ${d.getFullYear()}`;

      if (label in counts) {
        counts[label]++;
      }
    });

    return counts;
  }
};

const studentEnrollCourse = async (userId: string) => {
  const enroll = await prisma.courseEnroll.findMany({
    where: {
      userId,
    },
  });

  return {
    enroll,
  };
};

// const studentChapterQuiz = async(chapterId: string, userId: string) =>{

//   const chapter = await prisma.chapter.findUnique({
//     where: {
//       id: chapterId
//     }
//   })

//   if(!chapter){
//     throw new ApiError(httpStatus.NOT_FOUND, "chapter not found");
//   }

//   // const quiz = await prisma.chapter.findUnique({
//   //   where:{
//   //     id: chapterId
//   //   },
//   //   select:{
//   //     stepEight:{
//   //       select:{
//   //         stepEightQuizSessions:{
//   //           where:{
//   //             userId: userId
//   //           },
//   //           select:{
//   //             stepEightQuizAttempts:{

//   //             }
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }
//   // })

//   const quiz = await prisma.stepEight.findMany({
//     where:{
//       chapterId
//     },
//     select:{
//       questionType: true,
//       questionDescription: true,
//       stepEightQuizSessions:{
//         select: {
//           stepEightQuizAttempts:{
//             where:{
//               // isCorrect: false
//             }
//           }
//         }
//       }
//     }
//   })

//   return {
//     quiz
//   }
// }

const studentChapterQuizAttempt = async (chapterId: string, userId: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "chapter not found");
  }

  const quiz = await prisma.stepEight.findMany({
    where: {
      chapterId,
    },
    select: {
      questionType: true,
      questionDescription: true,
      stepEightQuizSessions: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
          createdAt: true,
          stepEightQuizAttempts: {
            select: {
              isCorrect: true,
              selectedOption: true,
              quizId: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  // Count right and wrong attempts per session
  const enrichedQuiz = quiz.map((q) => {
    const sessions = q.stepEightQuizSessions.map((session) => {
      const totalAttempts = session.stepEightQuizAttempts.length;
      const correctAttempts = session.stepEightQuizAttempts.filter(
        (a) => a.isCorrect
      ).length;
      const wrongAttempts = totalAttempts - correctAttempts;

      return {
        sessionId: session.id,
        attemptedAt: session.createdAt,
        totalAttempts,
        correctAttempts,
        wrongAttempts,
        attempts: session.stepEightQuizAttempts,
      };
    });

    return {
      questionType: q.questionType,
      questionDescription: q.questionDescription,
      sessions,
    };
  });

  return {
    quiz: enrichedQuiz,
  };
};

const studentProgress = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not foud");
  }

  const studentProgress = await prisma.stepEight.findMany({
    select: {
      chapter: {
        select: {
          chapterName: true,
          chapterDescription: true,
          stepEight: {
            select: {
              id: true,
              stepEightQuizSessions: {
                select: {
                  stepEightQuizAttempts: {
                    select: {
                      selectedOption: true,
                      isCorrect: true,
                      stepEightQuiz: {
                        select: {
                          questionText: true,
                          optionA: true,
                          optionB: true,
                          optionC: true,
                          optionD: true,
                        },
                      },
                    },
                  },
                },
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const quizPracticed = await prisma.stepEightQuizSession.count({
    where: {
      userId,
    },
  });

  const studentInfo = await prisma.user.findUnique({
    where:{
      id: userId
    },
    select:{
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      studentProfiles: {
        select: {
          profileImage: true,
        },
      },
    }
  })

  let correctQuiz = 0;
  let wrongQuiz = 0;

  for (const progress of studentProgress) {
    for (const step of progress.chapter.stepEight) {
      for (const session of step.stepEightQuizSessions) {
        for (const attempt of session.stepEightQuizAttempts) {
          if (attempt.isCorrect) {
            correctQuiz++;
          } else {
            wrongQuiz++;
          }
        }
      }
    }
  }

  const total = correctQuiz + wrongQuiz;
  const correctAnswerRate = total > 0 ? (correctQuiz / total) * 100 : 0;


  const courseProgress = await prisma.courseEnroll.findMany({
    where:{
      userId
    },
    select:{
      subject:{
        select: {
          id: true,
          subjectName: true,
          subjectDescription: true
        }
      }
    }
  })

  return {
    quizPracticed,
    correctQuiz,
    wrongQuiz,
    correctAnswerRate: parseFloat(correctAnswerRate.toFixed(2)),
    studentInfo,
    courseProgress
    // studentProgress,
  };
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
  studentEnrollCourse,
  studentChapterQuizAttempt,
  studentProgress,
};
