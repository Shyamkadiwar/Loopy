import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Define the schema for request validation
const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(7, "Password must be at least 7 characters"),
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
});

type SignUpBody = z.infer<typeof signUpSchema>;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate request body
        const result = signUpSchema.safeParse(body);
        if (!result.success) {
            return Response.json({
                success: false,
                message: "Invalid input data",
                errors: result.error.errors
            }, { status: 400 });
        }

        const { name, email, password, username } = result.data;

        // Use Promise.race to implement a timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 10000)
        );
        
        // Check for existing email or username
        const existingUser = await Promise.race([
            prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                },
                select: { email: true, username: true }
            }),
            timeout
        ]) as { email: string; username: string } | null;

        if (existingUser) {
            const message = existingUser.email === email 
                ? "Email already exists. Please sign in."
                : "Username already taken. Please choose another.";
                
            return Response.json({
                success: false,
                message
            }, { status: 400 });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await Promise.race([
            prisma.user.create({
                data: {
                    name,
                    email,
                    username,
                    password_hash: hashedPassword,
                    reputation_points: 0
                },
                select: { id: true }
            }),
            timeout
        ]);

        if (!newUser) {
            return Response.json({
                success: false,
                message: "Failed to create user account"
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: "User registered successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating user:", error);
        
        const errorMessage = error instanceof Error 
            ? error.message === 'Database timeout'
                ? "Service temporarily unavailable. Please try again."
                : error.message
            : "Something went wrong while creating user";

        return Response.json({
            success: false,
            message: errorMessage
        }, { status: error instanceof Error && error.message === 'Database timeout' ? 503 : 500 });
    }
}