import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { ITopic } from "./topic.interface";



const createTopic = async(topicData: ITopic) => {
    const chapter = await prisma.chapter.findUnique({
        where: {
            id: topicData.chapterId
        }
    })

    if(!chapter){
        throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
    }

    const topic = await prisma.topic.create({
        data: {
            ...topicData
        }
    })

    return {topic};
}


export const Topicervice = {
    createTopic
}