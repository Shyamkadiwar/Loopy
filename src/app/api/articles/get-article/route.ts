import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not authenticated",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const userId = session.user.id

        const articles = await prisma.article.findMany({
            where : {user_id : userId},
            include : {
                user : {
                    select : {
                        name : true,
                        email : true,
                        username : true,
                    }
                },
                comments : {
                    select : {
                        comment_text : true
                    }
                },
                _count : {
                    select : {
                        comments : true
                    }
                },
                votes : {
                    select : {
                        vote_type : true
                    }
                }
            },
            orderBy : {
                created_at : "desc"
            }
        })

        if (articles.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No article found for user",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedArticles = articles.map((article)=>({
            ...article,
            upVoteCount : article.votes.filter(v => v.vote_type === "upvote").length,
            downVoteCount : article.votes.filter(v => v.vote_type === "downvote").length
        }))

        return new Response(
            JSON.stringify({
                success: true,
                message: "Article Fetched succesfully",
                data: transformedArticles
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while fetching article:", error);
        return new Response(
            JSON.stringify({
            success: false,
            message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );        
    }
}