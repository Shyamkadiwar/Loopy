import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request : Request, {params}: {params : Promise<{questionId : string}>}){
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

        const {questionId} = await params

        const question = await prisma.question.findUnique({
            where : {id : questionId},
            include : {
                user : {
                    select : {
                        id : true,
                        username : true,
                        name : true,
                        image : true,
                    }
                },
                answers : {
                    include : {
                        user : {
                            select : {
                                id : true,
                                name : true,
                                username : true,
                                image : true,
                            }
                        },
                        comments: {
                            select: {
                                id: true,
                                comment_text: true,
                                user: {
                                    select: {
                                        name: true,
                                        username : true,
                                        image: true
                                    }
                                }
                            }
                        },
                        votes: {
                            select: {
                                vote_type: true,
                            },
                        },
                    }   
                },
                _count: {
                    select: {
                        comments: true,
                        answers: true
                    }
                }
            }
        })

        if(!question){
            return new Response(
                JSON.stringify({
                success: false,
                message: "No question found",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedQuestion = {
            ...question,
            answers: question.answers.map((answer)=>{
                const upVoteCount = answer.votes.filter((v) => v.vote_type === "upvote").length;
                const downVoteCount = answer.votes.filter((v) => v.vote_type === "downvote").length;

                return {
                    ...answer,
                    upVoteCount,
                    downVoteCount,
                    totalVotes: upVoteCount + downVoteCount
                }
            })
        }

        return new Response(
            JSON.stringify({
            success: true,
            message: "Question Fetched successfully",
            data: transformedQuestion
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

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