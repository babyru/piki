"use server";

import { revalidatePath } from "next/cache";
import { connectToDb } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firsName lastName clerkId",
  });

// ADD Image
export const addImage = async ({ image, userId, path }: AddImageParams) => {
  try {
    await connectToDb();
    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    console.log({ error });
  }
};

// UPDATE IMAGE
export const updateImage = async ({
  image,
  userId,
  path,
}: UpdateImageParams) => {
  try {
    await connectToDb();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or Image not found");
    }
    const updatedImage = Image.findByIdAndUpdate(imageToUpdate._id, image, {
      new: true,
    });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    console.log({ error });
  }
};

// DELETE IMAGE
export const deleteImage = async (imageId: string) => {
  try {
    await connectToDb();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    console.log({ error });
  } finally {
    redirect("/");
  }
};

// GET IMAGE BY ID
export const getImageById = async (imageId: string) => {
  try {
    await connectToDb();

    const image = await populateUser(Image.findById(imageId));

    if (!image) {
      throw new Error("image not found");
    }

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    console.log({ error });
    throw new Error(`failed to GET IMAGE BY ID`);
  }
};

// GET ALL IMAGES
export const getAllImages = async ({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) => {
  try {
    await connectToDb();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=piki";

    if (searchQuery) {
      expression += `AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    console.log({ error });
    throw new Error(`failed to GET ALL IMAGES`);
  }
};



// GET IMAGE BY USER

export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDb();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}