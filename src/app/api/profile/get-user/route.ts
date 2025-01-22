import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request : Request) {
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
    
        const details = await prisma.user.findUnique({
            where : {id:userId},
            select : {
                email : true,
                name : true,
                image : true,
                bio : true,
                reputation_points : true,
                created_at : true,
                interest : true,
                links :true,
            }
        })
    
        if (!details) {
            return new Response(
                JSON.stringify({
                success: false,
                message: "Error while fetching user details",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }
    
        return new Response(
            JSON.stringify({
            success: true,
            message: "User details fetched successfully",
            data : details
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