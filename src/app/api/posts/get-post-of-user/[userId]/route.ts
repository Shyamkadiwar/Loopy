import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request, {params} : {params : {userId : string}}) {
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

        const userId = params.userId

        const posts = await prisma.post.findMany({
            where : {user_id : userId},
            include : {
                user : {
                    select : {
                        name : true,
                        email : true,
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

        if (posts.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No post found for user",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedPosts = posts.map((post)=>({
            ...post,
            upVoteCount : post.votes.filter(v => v.vote_type === "upvote").length,
            downVoteCount : post.votes.filter(v => v.vote_type === "downvote").length
        }))

        return new Response(
            JSON.stringify({
                success: true,
                message: "Post Fetched succesfully",
                data: transformedPosts
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while fetching post:", error);
        return new Response(
            JSON.stringify({
            success: false,
            message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );        
    }
}