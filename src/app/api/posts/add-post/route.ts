import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from 'zod'

const postSchema = z.object({
    title: z.string().min(3, "Minimum 3 character required"),
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not authenticated",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const userId = session.user.id
        const body = await request.json()
        const result = postSchema.safeParse(body)
        if (!result.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { title, description, images, links } = result.data
        const post = await prisma.post.create({
            data: {
                user_id: userId,
                title,
                description,
                images,
                links,
            }
        })

        if (!post) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Error while adding post",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                reputation_points: {
                    increment: 2
                }
            }
        })

        return new Response(
            JSON.stringify({
                success: true,
                message: "Post added successfully",
                data: post,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while adding post:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}