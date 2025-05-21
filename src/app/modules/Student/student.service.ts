import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import stripe from "../../../helpars/stripe/stripe";
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
    message: "OTP sent! Please verify your email to complete registration."
  };

};


const courseDetails = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
    select:{
      subjectName: true,
      subjectDescription: true
    }
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }
  
  return {
    course: subject
  }
};

export const StudentService = {
  registration,
  courseDetails
};
