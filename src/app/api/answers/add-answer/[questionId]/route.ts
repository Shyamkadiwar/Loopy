import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { z } from 'zod'
import { useParams } from "next/navigation";

const answerSchema = z.object({
    answer_text: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function POST(request: Request) {
    try {
        const params = useParams<{ questionId: string }>();
        const session = await getServerSession(authOptions);
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
        const questionId = params.questionId

        const body = await request.json()
        const result = answerSchema.safeParse(body)
        if (!result.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const { answer_text, links, images } = result.data
        const answer = await prisma.answer.create({
            data: {
                user_id: userId,
                question_id: questionId,
                answer_text: answer_text,
                links: links,
                images: images
            }
        })

        if (!answer) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Error while adding answer",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                reputation_points: {
                    increment: 4
                }
            }
        })

        return new Response(
            JSON.stringify({
                success: true,
                message: "Answer added successfully",
                data: answer,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while adding answer:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}