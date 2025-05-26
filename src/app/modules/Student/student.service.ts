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


  return{
    profile
  }
};


const getStudentProfile = async(userId: string) => {
  const profile = await prisma.studentProfile.findUnique({
    where: {
      userId
    }
  })

  if(!profile){
    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
  }

  return {
    profile
  }
}

const getStudentById = async(userId: string) => {
  const profile = await prisma.studentProfile.findUnique({
    where: {
      userId
    }
  })

  if(!profile){
    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
  }

  return {
    profile
  }
}

export const StudentService = {
  registration,
  createUpdateProfile,
  getStudentProfile,
  getStudentById
};
