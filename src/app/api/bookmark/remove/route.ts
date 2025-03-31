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

        const { itemId, itemType } = await request.json();
        const user_id = session.user.id;

        if (!itemId || !itemType) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing required parameters" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const validTypes = ["article", "post", "snippet", "question"];
        if (!validTypes.includes(itemType)) {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid item type" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const bookmark = await prisma.bookmark.findFirst({
            where: {
                user_id,
                bookmarkable_id: itemId,
                bookmarkable_type: itemType,
            },
        });

        if (!bookmark) {
            return new Response(
                JSON.stringify({ success: false, message: "Bookmark not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        await prisma.bookmark.delete({
            where: {
                id: bookmark.id
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Bookmark removed successfully",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error removing bookmark:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}