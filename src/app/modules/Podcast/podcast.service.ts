import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { IPodcast } from "./podcast.interface";


const createPodcast = async(podcastData: IPodcast) => {
    const podcast = await prisma.podcast.create({
        data: {
            ...podcastData
        }
    })

    return {
        podcast
    }
}

const getChapterPodcast = async(chapterId: string, topicId: string) => {
    const chapter = await prisma.chapter.findUnique({
        where: {
            id: chapterId
        }
    })


    if(!chapter){
        throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
    }


    const podcast = await prisma.podcast.findMany({
        where: {
            chapterId,
        }
    })

    return {
        podcast
    }
}

export const PodcastService = {
    createPodcast,
    getChapterPodcast
}