import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request, {params} : {params : {userId : string}}){
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
    
        const userId = params.userId
    
        const userDetails = await prisma.user.findUnique({
            where : {id : userId},
            select : {
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
                        questions: true
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
                    questions: _count.questions
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