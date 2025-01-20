import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { profile } from "console";


export async function GET(request: Request){
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Not authenticated",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const snippets = await prisma.snippet.findMany({
            orderBy: {
                created_at: 'desc',
            },
            include : {
                user : {
                    select : {
                        email : true,
                        name : true
                    }
                },
                tags : {
                    include : {
                        tag : true
                    }
                },
                comments : true
            }
        })

        if(snippets.length === 0){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "No snippets found for the user",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
              );
        }

        const transformedSnippets = snippets.map((snippet)=>({
            ...snippet,
            tags : snippet.tags.map((snippetTag) => (snippetTag.tag) ),
            comments : snippet.comments.map((comment) => ({
                id: comment.id,
                comment_text: comment.comment_text,
                created_at: comment.created_at,
                user_id: comment.user_id,
            }))
        }))

        return new Response(
            JSON.stringify({
              success: true,
              message: "Snippets fetched successfully",
              data: transformedSnippets,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    }
    catch (error) {
        console.error("Error while fetching snippets: ", error);
        return new Response(
        JSON.stringify({
            success: false,
            message: "Internal server error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
        );    
    }
}