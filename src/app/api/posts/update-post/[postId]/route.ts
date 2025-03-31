import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from 'zod'

const postSchema = z.object({
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function POST(request: Request, {params} : {params : {postId : string}}){
    try {
        const session = await getServerSession(authOptions)
        if(!session?.user){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "User not authenticated",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await request.json()
        const result = postSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const {description, images, links} = result.data
        const postId = params.postId

        const newPost = await prisma.post.update({
            where : {id : postId},
            data : {
                description,
                links,
                images
            }
        })

        if(!newPost){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating post details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
              success: true,
              message: "successfully updated post",
              data : newPost
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while updating post:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}