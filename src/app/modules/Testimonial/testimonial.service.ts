import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { ITestimonial } from "./testimonial.interface";

const createTestimonial = async (testimonialdata: ITestimonial) => {
  const testimonial = await prisma.testimonial.create({
    data: {
      ...testimonialdata,
    },
  });

  return testimonial;
};

const getAllTestimonial = async () => {
  const testimonial = await prisma.testimonial.findMany({
    where: {
      isdisplay: true,
    },
  });

  return testimonial;
};

const displayTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  const testimonial = await prisma.testimonial.update({
    where: {
      id,
    },
    data: {
      isdisplay: true,
    },
  });

  return testimonial;
};

const deleteTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  await prisma.testimonial.delete({
    where: {
      id,
    },
  });
};

const singleTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  return testimonial;
};

export const TestimonialService = {
  createTestimonial,
  getAllTestimonial,
  displayTestimonial,
  deleteTestimonial,
  singleTestimonial
};
