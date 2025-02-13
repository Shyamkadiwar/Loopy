import { prisma } from "@/lib/prisma";
import { z } from 'zod';

const usernameSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim().toLowerCase();

    if (!username) {
      return Response.json({
        success: false,
        message: "Username is required"
      }, { status: 400 });
    }

    const result = usernameSchema.safeParse({ username });
    
    if (!result.success) {
      const errors = result.error.format().username?._errors || [];
      return Response.json({
        success: false,
        message: errors[0] || "Invalid username format",
        isValid: false
      }, { status: 200 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    return Response.json({
      success: true,
      isValid: true,
      isAvailable: !existingUser,
      message: existingUser ? "Username is already taken" : "Username is available"
    }, { status: 200});

  } catch (error) {
    console.error("Username check error:", error);
    return Response.json({
      success: false,
      message: "Error checking username availability"
    }, { status: 500 });
  }
}