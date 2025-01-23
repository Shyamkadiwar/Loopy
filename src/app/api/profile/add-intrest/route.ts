import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const interestSchema = z.object({
    interests: z.array(z.string()),
});


export async function POST(request: Request){
    try {
        const session = await getServerSession(authOptions);
            if (!session?.user) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: "User not authenticated",
                    }),
                    { status: 401, headers: { "Content-Type": "application/json" } }
                );
            }
        
            const userId = session.user.id;
        
            const body = await request.json();
            const result = interestSchema.safeParse(body);
        
            if (!result.success) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: "Invalid input data",
                        errorDetails: result.error.format(),
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
    
            const {interests} = result.data
            const user = await prisma.user.findUnique({
                where : {id : userId},
                select : {interest : true}
            })
            if (!user) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: "User not found",
                    }),
                    { status: 404, headers: { "Content-Type": "application/json" } }
                );
            }
    
            const currentInterests = user.interest || []
            const updatedInterests = [...new Set([...currentInterests, ...interests])]
    
            const updatedUser = await prisma.user.update({
                where : {id : userId},
                data : {interest : updatedInterests}
            })
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Links updated successfully",
                    data: updatedUser.interest,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
    } catch (error) {
        console.error("Error updating user intrests:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error updating user intrests",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}