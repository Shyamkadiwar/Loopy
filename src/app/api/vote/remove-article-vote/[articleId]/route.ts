import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function DELETE(request: Request) {
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

        const userId = session.user.id;
        const url = new URL(request.url);
        const articleId = url.pathname.split("/").pop();

        if (!articleId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Article ID is required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if the user has voted on this article
        const existingVote = await prisma.vote.findFirst({
            where: {
                user_id: userId,
                voteable_id: articleId,
                voteable_type: "Article"
            }
        });

        if (!existingVote) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No vote found to delete",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Delete the vote
        await prisma.vote.delete({
            where: {
                id: existingVote.id,
            }
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Vote deleted successfully",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while deleting vote:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}