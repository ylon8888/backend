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
import { EnrollStatus, Prisma, UserRole } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { date } from "zod";

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
                  profile: true,
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
        profile: review.user.profile,
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

  const chapter = await prisma.subject.findUnique({
    where: { id: entrollData.subjectId },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Chapter not found");
  }

  const existingEnroll = await prisma.courseEnroll.findFirst({
    where: {
      userId: entrollData.userId,
      subjectId: entrollData.subjectId,
    },
  });

  if (existingEnroll) {
    return {
      message: "you are already enrolled in this course",
    };
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

  const chapter = await prisma.subject.findUnique({
    where: {
      id: data.subjectId,
    },
    select: {
      chapters: {
        select: {
          sLNumber: true,
          id: true
        }
      }
    }
  });

  const step = await prisma.subject.findUnique({
    where: {
      id: data.subjectId,
    },
    select: {
      chapters: {
        select: {
          stepOne: {
            select: {
              type: true,
            }
          }
        }
      }
    }
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }


  console.log(chapter)

  console.log(step)

  if (enrollment.otp !== data.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  if (enrollment.otp === data.otp) {
    await prisma.courseEnroll.update({
      where: { id: enrollment.id },
      data: { enrollStatus: EnrollStatus.SUCCESS, otp: null },
    });
    
  }

  return {
    success: true,
    message: "Enrollment verified successfully",
    email: user.email,
  };
};

const checkingEnrollment = async (
  userId: string,
  subjectId: string
) => {
  const enroll = await prisma.courseEnroll.findFirst({
    where: {
      userId,
      subjectId,
    },
  });


  return {
    isEnrilled: enroll?.enrollStatus
  }
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

export const CourseService = {
  courseDetails,
  courseReview,
  getCourseReview,
  createCourseEnroll,
  enrollVerification,
  checkingEnrollment,
  getAllCourseReview,
};
