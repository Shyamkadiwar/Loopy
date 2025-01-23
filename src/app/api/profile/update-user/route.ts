import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const userSchema = z.object({
    name : z.string().min(1,"Minimum 1 character required"),
    bio : z.string().min(1,"Minimum 1 character required"),
})

export async function POST(request : Request){
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
    
        const body = await request.json()
        const result = userSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
    
        const {name, bio} = result.data
        const userId = session.user.id
    
        const updatedUser = await prisma.user.update({
            where : {id : userId},
            data : {
                name : name,
                bio : bio,
            }
        })
    
        if(!updatedUser){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating user details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    
        return new Response(
            JSON.stringify({
              success: true,
              message: "User details updated successfully",
              data : updatedUser
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error while updating user details:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}