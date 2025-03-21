import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const userSchema = z.object({
    name: z.string().min(1, "Minimum 1 character required"),
    bio: z.string().min(1, "Minimum 1 character required"),
    interest: z.array(z.string()).optional(),
    links: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
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
        if (!result.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid input data",
                    errors: result.error.format(),
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { name, bio, interest, links } = result.data
        const userId = session.user.id

        // Prepare the update data object
        const updateData: any = {
            name,
            bio,
        };

        // Add optional fields if provided
        if (interest !== undefined) {
            updateData.interest = interest;
        }

        if (links !== undefined) {
            updateData.links = links;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        if (!updatedUser) {
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
                data: updatedUser
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