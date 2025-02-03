import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not authenticated",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const userId = session.user.id
        const answers = await prisma.answer.findMany({
            where: { id: userId },
            orderBy: {
                created_at: "desc"
            },
            include: {
                question: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        created_at: true,
                    }
                },
                _count: {
                    select: {
                        votes: true
                    }
                },
                votes: {
                    select: {
                        vote_type: true
                    }
                }
            }
        })

        if (answers.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No answers found for user",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedAnswers = answers.map(answer => ({
            ...answer,
            upvoteCount: answer.votes.filter(vote => vote.vote_type === 'upvote').length,
            downvoteCount: answer.votes.filter(vote => vote.vote_type === 'downvote').length,
        }))

        return new Response(
            JSON.stringify({
                success: false,
                message: "Answers Fetched succesfully",
                data: transformedAnswers
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while fetching answer:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}