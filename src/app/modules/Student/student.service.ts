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
import { UserRole } from "@prisma/client";

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

const courseDetails = async (subjectId: string) => {
  // Fetch course details
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, subjectName: true, subjectDescription: true },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  // Get rating data
  const ratingData = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
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

  return {
    success: true,
    message: "Course details retrieved successfully",
    data: {
      course: subject,
      averageRating,
      totalReviews,
      chapterCount
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

export const StudentService = {
  registration,
  courseDetails,
  courseReview,
  getCourseReview,
};
