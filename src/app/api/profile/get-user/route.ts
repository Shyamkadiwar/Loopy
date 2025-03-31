import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
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
    
        const userId = session.user.id
    
        const userDetails = await prisma.user.findUnique({
            where : {id: userId},
            select : {
                email : true,
                name : true,
                image : true,
                bio : true,
                reputation_points : true,
                created_at : true,
                interest : true,
                links : true,
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

        const { _count, ...details } = userDetails;
    
        return new Response(
            JSON.stringify({
            success: true,
            message: "User details fetched successfully",
            data : {
                ...details,
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
    }
    catch (error) {
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