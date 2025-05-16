import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IContact } from "./contact.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";

const createContact = async(contactData: IContact) => {
    const contact = await prisma.contact.create({
        data: {
            ...contactData
        }
    })

    return contact;
}


const getAllContact = async (  filters: {
  searchTerm?: string;
  date?: string;
},
options: IPaginationOptions) => {
  const { searchTerm, date } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "phone", "email"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

    // Add date filter (only if a date is provided)
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
      andConditions.push({
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

  const whereConditions: Prisma.ContactWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const order = await prisma.contact.findMany({
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

  const total = await prisma.contact.count({
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
    data: order,
  };
};


const singleContact = async(id: string) => {
  const contact = await prisma.contact.findUnique({
    where: {
      id
    }
  })

  if(!contact){
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
  }

  return contact;
}

const deleteContact = async(id: string) => {
  const contact = await prisma.contact.findUnique({
    where: {
      id
    }
  })

  if(!contact){
    throw new ApiError(httpStatus.NOT_FOUND, "Contact not found");
  }

  await prisma.contact.delete({
    where: {
      id
    }
  })
}

export const ContactService = {
    createContact,
    getAllContact,
    singleContact,
    deleteContact
}