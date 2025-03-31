import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const voteSchema = z.object({
    vote_type: z.enum(["upvote", "downvote"]),
    voteable_type: z.literal("Article")
});

export async function POST(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not authenticated",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const body = await request.json();
        const result = voteSchema.safeParse(body);
        if (!result.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { vote_type, voteable_type } = result.data;
        const {articleId} = await params
        const userId = session.user.id;

        if (!articleId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Article ID is required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if user already voted on this answer
        const existingVote = await prisma.vote.findFirst({
            where: {
                user_id: userId,
                voteable_id: articleId,
                voteable_type: "Article"
            }
        });

        if (existingVote) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User has already voted on this article",
                }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create vote entry
        const vote = await prisma.vote.create({
            data: {
                vote_type,
                voteable_type,
                articleId,
                user_id: userId,
                voteable_id: articleId,
            }
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Vote added successfully",
                data: vote,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while adding vote:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
