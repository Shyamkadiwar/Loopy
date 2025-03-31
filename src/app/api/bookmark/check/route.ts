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
                    isBookmarked: false
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const itemType = searchParams.get('itemType');
        
        if (!itemId || !itemType) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: "Missing required parameters", 
                    isBookmarked: false 
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const validTypes = ["article", "post", "snippet", "question"];
        if (!validTypes.includes(itemType)) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: "Invalid item type", 
                    isBookmarked: false 
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const bookmark = await prisma.bookmark.findFirst({
            where: {
                user_id: session.user.id,
                bookmarkable_id: itemId,
                bookmarkable_type: itemType,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                isBookmarked: !!bookmark
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error checking bookmark status:", error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: "Internal server error", 
                isBookmarked: false 
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}