import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ContactService } from "./contact.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";


const createContact = catchAsync(async (req: Request, res: Response) => {

    const contact = await ContactService.createContact(req.body);

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Thank you for contacting us. We’ll get back to you shortly.",
    data: contact,
  });
})

const getAllContact = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "date"]);
  const options = pick(req.query, paginationFields);

  const orders = await ContactService.getAllContact(filters,options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contact retrieved successfully",
    data: orders,
  });
});


const singleContact = catchAsync(async (req: Request, res: Response) => {

  const id = req.params.id;

  const orders = await ContactService.singleContact(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contact retrieved successfully",
    data: orders,
  });
});


const deleteContact = catchAsync(async (req: Request, res: Response) => {

  const id = req.params.id;

  const orders = await ContactService.deleteContact(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Contact deleted successfully",
    data: orders,
  });
});


export const ContactController = {
    createContact,
    getAllContact,
    singleContact,
    deleteContact
}