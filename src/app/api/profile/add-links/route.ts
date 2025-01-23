import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const linksSchema = z.object({
    links: z.array(
        z.object({
            displayName: z.string().min(1, "Display name is required"),
            url: z.string().url("Invalid URL format"),
        })
    ),
});

export async function POST(request: Request) {
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
        const result = linksSchema.safeParse(body);

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

        const { links } = result.data;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { links: true },
        });

        if (!user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not found",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const existingLinks = (user.links as Array<{ displayName: string; url: string }>) || [];
        const updatedLinks = [
            ...existingLinks,
            ...links.filter(
                (newLink) => !existingLinks.some((link) => link.url === newLink.url)
            ),
        ];

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { links: updatedLinks },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Links updated successfully",
                data: updatedUser.links,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error updating user links:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error updating user links",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}