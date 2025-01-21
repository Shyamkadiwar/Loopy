import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { date } from "zod";

export async function GET(request : Request){
    try {
        const session = await getServerSession(authOptions)
        if(!session?.user){
            return new Response(
                JSON.stringify({
                success: false,
                message: "User not authenticated",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );  
        }

        const userId = session.user.id

        const questions = await prisma.question.findMany({
            where : {user_id : userId},
            include : {
                answers : {
                    select : {
                        id  :true,
                        answer_text : true,
                        votes : true
                    }   
                },
                comments : {
                    select : {
                        id : true,
                        comment_text : true
                    }
                }
            },
            orderBy : {
                created_at : "desc"
            }
        })

        if(!questions){
            return new Response(
                JSON.stringify({
                success: false,
                message: "Error while fetching questions",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedQuestions = questions.map((question) => ({
            ...question,
            answers : question.answers.map((answer)=>{
                const upVoteCount = answer.votes.filter((v)=> v.vote_type === "upvote").length;
                const downVoteCount = answer.votes.filter((v)=> v.vote_type === "downvote").length;

                return {
                    ...answer,
                    up_vote_count : upVoteCount,
                    down_vote_count : downVoteCount
                }
            })
        }))

        return new Response(
            JSON.stringify({
            success: false,
            message: "Questions Fetched succesfully",
            data: transformedQuestions
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while adding question:", error);
        return new Response(
            JSON.stringify({
            success: false,
            message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}