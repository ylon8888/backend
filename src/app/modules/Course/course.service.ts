import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { ICourse, IUser } from "./course.interface";
import { EnrollStatus, Prisma, StepType, UserRole } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";

const courseDetails = async (subjectId: string) => {
  // Fetch course details
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { subjectName: true, subjectDescription: true },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  // Get rating data
  const ratingData = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      class: {
        select: {
          className: true,
        },
      },
      chapters: {
        select: {
          courseReviews: { select: { rating: true } },
        },
      },
    },
  });

  // Calculate average and count reviews
  let averageRating = 0;
  let totalReviews = 0;
  if (ratingData) {
    const allRatings = ratingData.chapters.flatMap((chapter) =>
      chapter.courseReviews.map((review) => review.rating)
    );

    totalReviews = allRatings.length;

    if (totalReviews > 0) {
      const total = allRatings.reduce((sum, rating) => sum + rating, 0);
      averageRating = Number((total / totalReviews).toFixed(1));
    }
  }

  const chapterData = await prisma.subject.findMany({
    where: {
      id: subjectId,
    },
    select: {
      chapters: {
        select: {
          subjectId: true,
        },
      },
    },
  });

  const chapters = chapterData[0]?.chapters || [];
  const chapterCount = chapters.length;

  const learnFromCourse = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      chapters: {
        select: {
          chapterName: true,
          chapterDescription: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Course details retrieved successfully",
    data: {
      course: subject,
      averageRating,
      totalReviews,
      chapterCount,
      learnFromCourse,
    },
  };
};

const courseReview = async (reviewData: any) => {
  const review = await prisma.courseReview.create({
    data: {
      ...reviewData,
    },
  });

  return {
    review,
  };
};

const getCourseReview = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const courseData = await prisma.subject.findMany({
    where: { id: subjectId },
    select: {
      chapters: {
        select: {
          courseReviews: {
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
            select: {
              rating: true,
              message: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Flatten all reviews into array of objects
  const reviews = courseData.flatMap((course) =>
    course.chapters.flatMap((chapter) =>
      chapter.courseReviews.map((review) => ({
        name: `${review.user.firstName} ${review.user.lastName}`,
        email: review.user.email,
        rating: review.rating,
        message: review.message,
      }))
    )
  );

  return { reviews };
};

// Course Entroll
const createCourseEnroll = async (entrollData: ICourse) => {
  const user = await prisma.user.findUnique({
    where: { id: entrollData.userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: entrollData.subjectId },
  });

  if (!subject) {
    throw new ApiError(httpStatus.BAD_REQUEST, "subject not found");
  }

  const existingEnroll = await prisma.courseEnroll.findFirst({
    where: {
      userId: entrollData.userId,
      subjectId: entrollData.subjectId,
    },
  });

  if (existingEnroll) {
    if (existingEnroll.enrollStatus === EnrollStatus.SUCCESS) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Already enrolled in this course"
      );
    }

    if (existingEnroll.enrollStatus === EnrollStatus.PENDING) {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const html = otpEmail(randomOtp);

      await prisma.courseEnroll.update({
        where: { id: existingEnroll.id },
        data: { otp: randomOtp },
      });

      await emailSender("OTP", user.email, html);

      return {
        id: user.id,
        courseId: existingEnroll.subjectId,
        email: user.email,
        message: "OTP sent! Please verify your email to complete enrollment.",
      };
    }
  }

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const html = otpEmail(randomOtp);

  // Fresh enrollment
  const newEnroll = await prisma.courseEnroll.create({
    data: {
      userId: entrollData.userId,
      subjectId: entrollData.subjectId,
      name: entrollData.name,
      phoneNumber: entrollData.phoneNumber,
      otp: randomOtp,
    },
  });

  await emailSender("OTP", user.email, html);

  return {
    id: user.id,
    courseId: newEnroll.subjectId,
    email: user.email,
    message: "OTP sent! Please verify your email to complete enrollment.",
  };
};

const enrollVerification = async (data: {
  userId: string;
  subjectId: string;
  otp: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const course = await prisma.subject.findUnique({
    where: {
      id: data.subjectId,
    },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const enrollment = await prisma.courseEnroll.findFirst({
    where: {
      userId: data.userId,
      subjectId: data.subjectId,
    },
  });

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Enrollment not found");
  }

  const subjectDetails = await prisma.subject.findUnique({
    where: {
      id: data.subjectId,
    },
    select: {
      chapters: {
        select: {
          sLNumber: true,
          id: true,
          stepOne: {
            select: {
              type: true,
            },
          },
        },
      },
    },
  });

  if (
    !subjectDetails ||
    !subjectDetails.chapters ||
    subjectDetails.chapters.length === 0
  ) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter or StepOne not found");
  }

  const firstChapter = subjectDetails.chapters[0];

  if (enrollment.otp !== data.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (enrollment.otp === data.otp) {
    await prisma.courseEnroll.update({
      where: { id: enrollment.id },
      data: { enrollStatus: EnrollStatus.SUCCESS, otp: null },
    });

    const existingProgress = await prisma.userChapterProgress.findFirst({
      where: {
        userId: user.id,
        chapterId: firstChapter.id,
      },
    });

    const existingStep = await prisma.userStepProgress.findFirst({
      where: {
        userId: user.id,
        chapterId: firstChapter.id,
      },
    });

    if (existingProgress && existingStep) {
      return;
    }

    // Student Chapter Progress
    await prisma.userChapterProgress.create({
      data: {
        userId: user.id,
        chapterId: firstChapter.id,
        isCompleted: false, // True when chapter is completed
      },
    });

    // chapter Progress
    // await prisma.userStepProgress.create({
    //   data: {
    //     userId: user.id,
    //     chapterId: firstChapter.id,
    //     stepId: firstChapter?.id,
    //     stepType: StepType.STEP_ONE,
    //   },
    // });
  }

  return {
    success: true,
    message: "Enrollment verified successfully",
    email: user.email,
  };
};

const checkingEnrollment = async (userId: string, subjectId: string) => {
  const enroll = await prisma.courseEnroll.findFirst({
    where: {
      userId,
      subjectId,
    },
  });

  return {
    isEnrilled: enroll?.enrollStatus,
  };
};

const getAllCourseReview = async (
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
      OR: ["title", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.CourseReviewWhereInput = {
    AND: [...andConditions],
  };

  const blogs = await prisma.courseReview.findMany({
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

  const total = await prisma.courseReview.count({
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
    data: blogs,
  };
};

const getAllReview = async (
  filters: { searchTerm?: string },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const {
    page,
    skip,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = paginationHelpers.calculatePagination(options);

  // Build search conditions
  const whereConditions: Prisma.CourseReviewWhereInput = {};

  if (searchTerm) {
    // Assuming review message or user name can be searched
    whereConditions.OR = [
      {
        message: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        user: {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  // Get total count of matching reviews
  const total = await prisma.courseReview.count({ where: whereConditions });

  // Fetch paginated reviews
  const reviewsData = await prisma.courseReview.findMany({
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip,
    take: limit,
    select: {
      rating: true,
      message: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Map reviews to desired format
  const reviews = reviewsData.map((review) => ({
    name: `${review.user.firstName} ${review.user.lastName}`,
    email: review.user.email,
    rating: review.rating,
    message: review.message,
  }));

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: reviews,
  };
};

const chapterEnrollStudent = async (
  chapterId: string,
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
      OR: ["title", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ChapterWhereInput = {
    AND: [...andConditions, { id: chapterId }],
  };

  const blogs = await prisma.chapter.findMany({
    where: {
      ...whereConditions,
    },
    skip,
    take: limit,
    select: {
      subject: {
        select: {
          createdAt: true,
          subjectName: true,
          courseEnrolls: {
            select: {
              name: true,
              phoneNumber: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.chapter.count({
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
    data: blogs,
  };
};

const capterQuizDetails = async (chapterId: string, userId: string) => {

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId
    }
  })

  if(!chapter){
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const courseEnroll = await prisma.$transaction(async (TX) => {
    const quiz = await TX.chapter.findMany({
      where: {
        id: chapterId,
      },
      select: {
        stepEight: {
          select: {
            stepEightQuizzes: {
              select: {
                stepEightQuizAttempts: {
                  // where: {
                  //   userId,
                  // },
                },
              },
            },
          },
        },
      },
    });


    return{
      quiz
    }
  });

  return {
    courseEnroll,
  };
};

export const CourseService = {
  courseDetails,
  courseReview,
  getCourseReview,
  createCourseEnroll,
  enrollVerification,
  checkingEnrollment,
  getAllCourseReview,
  getAllReview,
  chapterEnrollStudent,
  capterQuizDetails
};
