import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

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
            where : {
                visibility : "public"
            },
            orderBy: {
                created_at: 'desc',
            },
            include : {
                user : {
                    select : {
                        id : true,
                        username : true,
                        name : true
                    }
                },
                tags : {
                    include : {
                        tag : true
                    }
                },
                comments : {
                    select : {
                        id : true,
                        comment_text : true,
                        user : {
                            select : {
                                id : true,
                                name : true,
                                email : true
                            }
                        }
                    }
                }
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