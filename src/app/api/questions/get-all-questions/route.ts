import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: Request) {
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

        const questions = await prisma.question.findMany({
            include : {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                answers : {
                    select : {
                        id : true,
                        answer_text : true,
                        votes: {
                            select: {
                                vote_type: true,
                            },
                        },
                    }
                },
                comments : {
                    select : {
                        id : true,
                        comment_text : true
                    }
                },
                _count : {
                    select : {
                        comments : true
                    }
                }
            },
            orderBy : {
                created_at : "desc"
            }
        })

        if(questions.length === 0){
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No questions found for the user",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedQuestions = questions.map((question)=>({
            ...question,
            answers : question.answers.map((answer)=>{
                const upVoteCount = answer.votes.filter((v) =>  v.vote_type === "upvote").length
                const downVoteCount = answer.votes.filter((v) =>  v.vote_type === "downvote").length

                return {
                    ...answer,
                    upVoteCount : upVoteCount,
                    downVoteCount : downVoteCount 
                }
            })
        }))

        return new Response(
            JSON.stringify({
                success : true,
                message : "Questions fetched successfully",
                data : transformedQuestions,
            }),
            {status : 200, headers: { "Content-Type": "application/json" }}
        )
    }
    catch (error) {
        console.error("Error while fetching question:", error);
        return new Response(
            JSON.stringify({
            success: false,
            message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}