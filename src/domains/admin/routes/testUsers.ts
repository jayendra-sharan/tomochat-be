import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Route handler to create a new user and perform string matching from query param
export const createTestUsers = async (req: Request, res: Response) => {
  try {
    // Extract user data from request body (update fields as needed)
    const { token } = req.query;

    if (token !== "1415") {
      throw new Error("Unauthorized access");
    }
    const password = await bcryptjs.hash("admin@tomochat", 10);

    const users = [
      {
        email: "jayendra.sharan@gmail.com",
        password,
        userType: "system",
        displayName: "Jay",
        isEmailVerified: true,
      },
      {
        email: "j.1514@pm.me",
        password,
        userType: "system",
        displayName: "J1514",
        isEmailVerified: true,
      },
    ];
    // Create new user in DB

    const result = await Promise.all(
      users.map((u) =>
        prisma.user.create({
          data: {
            ...u,
          },
        })
      )
    );

    res.status(200).json({
      succes: "ok",
      user: JSON.stringify(result),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};
