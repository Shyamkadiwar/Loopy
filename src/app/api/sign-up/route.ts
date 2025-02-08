import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // Use Promise.race to implement a timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 10000)
        );
        
        const existingUser = await Promise.race([
            prisma.user.findUnique({
                where: { email },
                select: { email: true }
            }),
            timeout
        ]);

        if (existingUser) {
            return Response.json({
                success: false,
                message: "User already exists. Please sign in."
            }, { status: 400 });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await Promise.race([
            prisma.user.create({
                data: {
                    name,
                    email,
                    password_hash: hashedPassword,
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

    }
    catch (error) {
        console.error("Error creating user:", error);
        
        const errorMessage = error instanceof Error && error.message === 'Database timeout'
            ? "Service temporarily unavailable. Please try again."
            : "Something went wrong while creating user";

        return Response.json({
            success: false,
            message: errorMessage
        }, { status: 500 });
    }
}