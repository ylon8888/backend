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

  return profile;
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
  let startDate: Date;
  const now = new Date();

  if (period === "Monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else if (period === "Yearly") {
    startDate = new Date(now.getFullYear() - 4, 0, 1);
  } else if (period === "Quarterly") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else {
    throw new Error("Invalid period");
  }

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

    const counts: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      counts[label] = 0;
    }

    attempts.forEach(({ createdAt }) => {
      const date = new Date(createdAt);
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (label in counts) {
        counts[label]++;
      }
    });

    return counts;
  } else if (period === "Yearly") {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 5; i++) {
      const year = startDate.getFullYear() + i;
      counts[`${year}`] = 0;
    }

    attempts.forEach(({ createdAt }) => {
      const year = new Date(createdAt).getFullYear();
      if (counts[year]) {
        counts[year]++;
      } else if (year >= startDate.getFullYear()) {
        counts[year] = 1;
      }
    });

    return counts;
  } else if (period === "Quarterly") {
    const counts: Record<string, number> = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0,
    };

    attempts.forEach(({ createdAt }) => {
      const month = new Date(createdAt).getMonth(); // 0-11

      let label = "";
      if (month >= 0 && month <= 2) label = "Q1";
      else if (month >= 3 && month <= 5) label = "Q2";
      else if (month >= 6 && month <= 8) label = "Q3";
      else if (month >= 9 && month <= 11) label = "Q4";

      if (label in counts) {
        counts[label]++;
      }
    });

    return counts;
  }
};

const studentEnrollCourse = async (userId: string) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const enroll = await prisma.courseEnroll.findMany({
    where: {
      userId,
    },
    select:{
      subject:{
        select:{
          id: true,
          subjectName: true,
          subjectDescription: true,
          banner: true,
          _count:{
            select:{
              chapters: true
            }
          }
        }
      }
    }
  });

  return {
    enroll,
  };
};


const studentEnrollChapter = async (userId: string,subjectId: string) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  const enroll = await prisma.courseEnroll.findFirst({
    where: {
      userId,
      subjectId
    },
    select:{
      subject:{
        select:{
          id: true,
          subjectName: true,
          subjectDescription: true,
          chapters:{
            select:{
              id: true,
              sLNumber: true,
              chapterName: true,
              chapterDescription: true,
              thumbnail: true,
              userChapterProgress:{
                select:{
                  isCompleted: true
                },
                where:{
                  userId
                }
              }
            }
          }          
        }
      }
    }
  });

  return {
    enroll,
  };
};


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
              stepEightQuiz:true
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
    where: {
      id: userId,
    },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      studentProfiles: {
        select: {
          profileImage: true,
        },
      },
    },
  });

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

  // const courseProgress = await prisma.courseEnroll.findMany({
  //   where:{
  //     userId
  //   },
  //   select:{
  //     subject:{
  //       select: {
  //         id: true,
  //         subjectName: true,
  //         subjectDescription: true
  //       }
  //     }
  //   }
  // })

  return {
    quizPracticed,
    correctQuiz,
    wrongQuiz,
    correctAnswerRate: parseFloat(correctAnswerRate.toFixed(2)),
    studentInfo,
    // courseProgress
    // studentProgress,
  };
};

const subjectCourseProgress = async (userId: string) => {
  const enrollments = await prisma.courseEnroll.findMany({
    where: { userId },
    select: {
      subject: {
        select: {
          id: true,
          subjectName: true,
          subjectDescription: true,
          chapters: {
            select: {
              id: true,
              stepOne: { select: { id: true } },
              stepTwo: { select: { id: true } },
              stepThree: { select: { id: true } },
              stepFour: { select: { id: true } },
              stepFive: { select: { id: true } },
              stepSix: { select: { id: true } },
              stepSeven: { select: { id: true } },
              stepEight: { select: { id: true } },
              stepNine: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  const result = [];

  for (const enrollment of enrollments) {
    const subject = enrollment.subject;
    let totalSteps = 0;

    // Count steps for each chapter
    for (const chapter of subject.chapters) {
      if (chapter.stepOne) totalSteps += 1;
      if (chapter.stepTwo) totalSteps += 1;
      if (chapter.stepThree) totalSteps += 1;
      if (chapter.stepFour) totalSteps += 1;
      if (chapter.stepFive) totalSteps += 1;
      if (chapter.stepSix) totalSteps += 1;
      if (chapter.stepSeven) totalSteps += 1;
      if (chapter.stepEight) totalSteps += chapter.stepEight.length; // array
      if (chapter.stepNine) totalSteps += 1;
    }

    // 2. Count user's completed steps for this subject using correct relation field 'Chapter'
    const completedSteps = await prisma.userStepProgress.count({
      where: {
        userId,
        isCompleted: true,
        Chapter: {
          subjectId: subject.id,
        },
      },
    });

    const progressPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    result.push({
      subjectId: subject.id,
      subjectName: subject.subjectName,
      subjectDescription: subject.subjectDescription,
      totalSteps,
      completedSteps,
      progress: progressPercentage,
    });
  }

  return result;
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
  subjectCourseProgress,
  studentEnrollChapter
};
