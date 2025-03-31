import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request){
    try {
        const session = await getServerSession(authOptions)
        if(!session?.user){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "User not authenticated",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    
        const url = new URL(request.url);
        const userId = url.pathname.split("/").pop();

        if (!userId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "post ID is required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const userDetails = await prisma.user.findUnique({
            where : {id : userId},
            select : {
                id : true,
                name : true,
                username : true,
                email : true,
                image : true,
                bio : true,
                reputation_points : true,
                created_at : true,
                interest : true,
                links :true,
                _count: {
                    select: {
                        snippets: true,
                        comments: true,
                        answers: true,
                        questions: true,
                        articles: true,
                        posts: true,
                    }
                }
            }
        })
    
        if (!userDetails) {
            return new Response(
                JSON.stringify({
                success: false,
                message: "Error while fetching user details",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
        const { _count, ...userInfo } = userDetails;

        const snippets = await prisma.snippet.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        });
        
        const questions = await prisma.question.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: {
                        answers: true,
                        comments: true
                    }
                }
            }
        });
        
        const answers = await prisma.answer.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                question: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                _count: {
                    select: {
                        votes: true,
                        comments: true
                    }
                }
            }
        });
        
        const posts = await prisma.post.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: {
                        comments: true,
                        votes: true
                    }
                }
            }
        });
        
        const articles = await prisma.article.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: {
                        comments: true,
                        votes: true
                    }
                }
            }
        });
    
        return new Response(
            JSON.stringify({
            success: true,
            message: "User details fetched successfully",
            data : {
                ...userInfo,
                counts: {
                    snippets: _count.snippets,
                    comments: _count.comments,
                    answers: _count.answers,
                    questions: _count.questions,
                    articles: _count.articles,
                    posts: _count.posts
                },
                content:{
                    snippets,
                    answers,
                    questions,
                    posts,
                    articles
                }
            }
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while fetching user details:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}