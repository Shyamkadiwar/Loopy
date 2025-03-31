import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request, {params} : {params : {postId : string}}) {
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

        const postId = params.postId

        const post = await prisma.post.findUnique({
            where : {id : postId},
            include : {
                user : {
                    select : {
                        id : true,
                        name : true,
                        email : true,
                        username : true,
                    }
                },
                comments : {
                    select : {
                        comment_text : true,
                        user: {
                            select: {
                                id: true,
                                username: true,
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

        if (!post) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "No post found for user",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const transformedPosts = {
            ...post,
            upVoteCount : post.votes.filter(v => v.vote_type === "upvote").length,
            downVoteCount : post.votes.filter(v => v.vote_type === "downvote").length
        }

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