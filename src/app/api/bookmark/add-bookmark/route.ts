import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type BookmarkData = {
    user_id: string;
    bookmarkable_id: string;
    bookmarkable_type: "article" | "post" | "snippet" | "question";
    snippetId?: string;
    postId?: string;
    questionId?: string;
    articleId?: string;
};

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

        const validTypes: BookmarkData["bookmarkable_type"][] = ["article", "post", "snippet", "question"];
        if (!validTypes.includes(itemType)) {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid item type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const existingBookmark = await prisma.bookmark.findFirst({
            where: {
                user_id,
                bookmarkable_id: itemId,
                bookmarkable_type: itemType,
            },
        });

        if (existingBookmark) {
            return new Response(
                JSON.stringify({ success: false, message: "Already bookmarked" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const bookmarkData: BookmarkData = {
            user_id,
            bookmarkable_id: itemId,
            bookmarkable_type: itemType,
        };

        switch (itemType) {
            case "snippet":
                bookmarkData.snippetId = itemId;
                break;
            case "post":
                bookmarkData.postId = itemId;
                break;
            case "question":
                bookmarkData.questionId = itemId;
                break;
            case "article":
                bookmarkData.articleId = itemId;
                break;
        }

        const bookmark = await prisma.bookmark.create({
            data: bookmarkData,
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
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}