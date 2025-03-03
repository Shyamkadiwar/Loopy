import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(request: Request, { params }: { params: { snippetId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new Response(
                JSON.stringify({ success: false, message: "Not authenticated" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { snippetId } = params;
        if (!snippetId) {
            return new Response(
                JSON.stringify({ success: false, message: "Snippet ID is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const snippet = await prisma.snippet.findUnique({
            where: { id: snippetId, visibility: "public" },
            include: {
                user: {
                    select: { username: true, name: true }
                },
                tags: {
                    include: { tag: true }
                },
                comments: {
                    select: {
                        id: true,
                        comment_text: true,
                        user: {
                            select: { id: true, name: true, username: true }
                        }
                    }
                }
            }
        });

        if (!snippet) {
            return new Response(
                JSON.stringify({ success: false, message: "Snippet not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Snippet fetched successfully",
                data: {
                    ...snippet,
                    tags: snippet.tags.map(snippetTag => snippetTag.tag),
                }
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while fetching snippet: ", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
