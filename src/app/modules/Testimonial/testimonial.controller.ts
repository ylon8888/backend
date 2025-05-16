import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TestimonialService } from "./testimonial.service";


const createTestimonial = catchAsync(async (req: Request, res: Response) => {
    const userId =  "cmacfrkn90000ijixd4dzbwby";
    
    const body = {
        userId,
        ...req.body
    }

    const testimonial = await TestimonialService.createTestimonial(body);

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Testimonial created successfully",
    data: testimonial,
  });
})

const getAllTestimonial = catchAsync(async (req: Request, res: Response) => {


    const testimonial = await TestimonialService.getAllTestimonial();

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Testimonial retrive successfully",
    data: testimonial,
  });
})

const displayTestimonial = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id;

    const testimonial = await TestimonialService.displayTestimonial(id)

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Testimonial display successfully",
    data: testimonial,
  });
})

const deleteTestimonial = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id;

    const testimonial = await TestimonialService.deleteTestimonial(id)

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Testimonial deleted successfully",
    data: testimonial,
  });
})

export const TestimonialController = {
    createTestimonial,
    getAllTestimonial,
    displayTestimonial,
    deleteTestimonial
}