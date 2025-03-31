import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
    try {
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

        const user_id = session.user.id;

        const bookmarks = await prisma.bookmark.findMany({
            where: { user_id },
            include: {
                Snippet: true,
                Post: true,
                Article: true,
                Question: true,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Bookmarks fetched successfully",
                data: bookmarks,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while fetching bookmarks:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
