import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Route handler to create a new user and perform string matching from query param
export const createTomo = async (req: Request, res: Response) => {
  try {
    // Extract user data from request body (update fields as needed)
    const { token } = req.query;
    if (token !== "1514") {
      throw new Error("Unauthorized access");
    }
    const password = await bcryptjs.hash("admin@tomochat", 10);

    const input = {
      email: "admin@tomochat.xyz",
      password,
      userType: "system",
      displayName: "Tomo",
      id: "SYSTEM",
    };
    // Create new user in DB
    const user = await prisma.user.create({
      data: {
        ...input,
      },
    });

    res.status(200).json({
      succes: "ok",
      user: JSON.stringify(user),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
