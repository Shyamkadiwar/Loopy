import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from 'zod'

const questionSchema = z.object({
    title: z.string().min(3, "Minimum 3 character required"),
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function question(request: Request, {params} : {params : {questionId : string}}){
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
        const result = questionSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const {title, description, images, links} = result.data
        const questionId = params.questionId

        const newQuestion = await prisma.question.update({
            where : {id : questionId},
            data : {
                title,
                description,
                links,
                images
            }
        })

        if(!newQuestion){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating question details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
              success: true,
              message: "successfully updated question",
              data : newQuestion
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while updating question:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}