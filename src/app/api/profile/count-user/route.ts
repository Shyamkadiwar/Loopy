import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
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

    const userCount = await prisma.user.count()

    if(!userCount){
        return new Response(
            JSON.stringify({
              success: false,
              message: "Error while counting users",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
    
    return new Response(
        JSON.stringify({
          success: true,
          message: "User count fetched successfully",
          data : userCount
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
}