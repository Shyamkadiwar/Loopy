import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
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

        const url = new URL(request.url);
        const articleId = url.pathname.split("/").pop();

        if (!articleId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "article ID is required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const article = await prisma.article.findUnique({
            where : {id : articleId},
            include : {
                user : {
                    select : {
                        id : true,
                        name : true,
                        email : true,
                        username : true,
                        image : true,
                    }
                },
                comments : {
                    select : {
                        comment_text : true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
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
            }
        })

        if (!article) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No article found for user",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedArticles = {
            ...article,
            upVoteCount : article.votes.filter(v => v.vote_type === "upvote").length,
            downVoteCount : article.votes.filter(v => v.vote_type === "downvote").length
        }

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