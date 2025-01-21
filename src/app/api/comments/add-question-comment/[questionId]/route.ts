import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod"

const commentSchema = z.object({
    comment_text : z.string().min(2, "Minimum 2 charcter required"),
    commentable_type: z.string()
})

export async function POST(request: Request, {params} : {params : {questionId : string}}){
    try {
        const session = await getServerSession(authOptions)
        if(!session?.user){
            return new Response(
                JSON.stringify({
                success: false,
                message: "User not authenticated",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );    
        }

        const body = request.json();
        const result = commentSchema.safeParse(body)
        
        if(!result.success){
            return new Response(
                JSON.stringify({
                success: false,
                message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const {comment_text, commentable_type} = result.data
        const questionId = params.questionId
        const userId = session.user.id

        if(!questionId){
            return new Response(
                JSON.stringify({
                success: false,
                message: "Question id required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                comment_text : comment_text,
                commentable_id : questionId,
                commentable_type : commentable_type,
                questionId : questionId,
                user_id : userId
            }
        })

        if(!comment){
            return new Response(
                JSON.stringify({
                success: false,
                message: "Error while adding comment",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
            success: true,
            message: "Comment added successfully",
            data : comment
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while adding comment:", error);
        return new Response(
            JSON.stringify({
            success: false,
            message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}