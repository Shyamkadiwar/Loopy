import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from 'zod'
import { useParams } from "next/navigation";

const answerSchema = z.object({
    answer_text: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function answer(request: Request){
    try {
        const params = useParams<{ answerId: string }>();
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
        const result = answerSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const {answer_text, images, links} = result.data
        const answerId = params.answerId

        const newAnswer = await prisma.answer.update({
            where : {id : answerId},
            data : {
                answer_text,
                links,
                images
            }
        })

        if(!newAnswer){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating answer details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
              success: true,
              message: "successfully updated answer",
              data : newAnswer
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while updating answer:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}