import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { IUser } from "./course.interface";
import { UserRole } from "@prisma/client";


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
          CourseReview: { select: { rating: true } },
        },
      },
    },
  });

  // Calculate average and count reviews
  let averageRating = 0;
  let totalReviews = 0;
  if (ratingData) {
    const allRatings = ratingData.chapters.flatMap((chapter) =>
      chapter.CourseReview.map((review) => review.rating)
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
          CourseReview: {
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
      chapter.CourseReview.map((review) => ({
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
const createCourseEnroll = async (entrollData: any) => {
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

  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const html = otpEmail(randomOtp);

  if (existingEnroll) {
    if (existingEnroll.isVarified) {
      throw new ApiError(httpStatus.CONFLICT, "User already enrolled in this chapter");
    }

   
    await prisma.courseEnroll.update({
      where: { id: existingEnroll.id },
      data: { otp: randomOtp }, 
    });

    await emailSender("OTP", existingEnroll.email, html);

    return {
      id: user.id,
      email: existingEnroll.email,
       courseId: existingEnroll.subjectId,
      message: "OTP resent! Please verify your email to complete enrollment.",
    };
  }

  // Fresh enrollment
  const newEnroll = await prisma.courseEnroll.create({
    data: {
      userId: entrollData.userId,
      subjectId: entrollData.subjectId,
      name: entrollData.name,
      phoneNumber: entrollData.phoneNumber,
      email: entrollData.email,
      otp: randomOtp,
    },
  });

  await emailSender("OTP", newEnroll.email, html);

  return {
    id: user.id,
    courseId: newEnroll.subjectId,
    email: newEnroll.email,
    message: "OTP sent! Please verify your email to complete enrollment.",
  };
};


const enrollVerification = async (data: {
  userId: string;
  subjectId: string;
  otp: string;
}) => {

  const course = await prisma.subject.findUnique({
    where: {
      id: data.subjectId,
    }
  })

  if(!course){
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

  if (enrollment.isVarified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You have already verified");
  }

  if (enrollment.otp !== data.otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  await prisma.courseEnroll.update({
    where: { id: enrollment.id },
    data: {
      isVarified: true,
    },
  });

  return {
    success: true,
    message: "Enrollment verified successfully",
    email: enrollment.email,
  };
};



export const StudentService = {
  courseDetails,
  courseReview,
  getCourseReview,
  createCourseEnroll,
  enrollVerification,
};
