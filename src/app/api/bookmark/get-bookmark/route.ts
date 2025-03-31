import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
export async function POST(request: Request) {
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

        const { itemId, itemType } = await request.json();
        const user_id = session.user.id;

        // Debug logs
        console.log("Creating bookmark:", { user_id, itemId, itemType });

        // Make sure itemType is properly formatted for database lookup
        const bookmarkableType = itemType.toLowerCase();
        
        // Map to proper relation field
        let relationField = {};
        if (bookmarkableType === "snippet") {
            relationField = { snippetId: itemId };
        } else if (bookmarkableType === "post") {
            relationField = { postId: itemId };
        } else if (bookmarkableType === "article") {
            relationField = { articleId: itemId };
        } else if (bookmarkableType === "question") {
            relationField = { questionId: itemId };
        } else {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid item type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existingBookmark = await prisma.bookmark.findFirst({
            where: {
                user_id,
                bookmarkable_id: itemId,
                bookmarkable_type: bookmarkableType,
            },
        });

        if (existingBookmark) {
            return new Response(
                JSON.stringify({ success: false, message: "Already bookmarked" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                user_id,
                bookmarkable_id: itemId,
                bookmarkable_type: bookmarkableType,
                ...relationField,  // Add the proper relation field
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Bookmarked successfully",
                data: bookmark,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while bookmarking:", error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: "Internal server error",
                error: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}