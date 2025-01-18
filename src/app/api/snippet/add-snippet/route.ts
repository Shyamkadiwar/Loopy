import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/options";

const snippetSchema = z.object({
    email: z.string().email(),
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().min(1, "Description is required"),
    visibility: z.enum(["public", "private", "shared"]).optional().default("public"),
    tags: z.array(z.string()).optional()
});

type CreateSnippetRequest = z.infer<typeof snippetSchema>;

export async function POST(request: Request) {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }
        const userId = session.user.id;

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid request body - failed to parse JSON",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const validationResult = snippetSchema.safeParse(body);
        if (!validationResult.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Invalid request data",
                    errors: validationResult.error.issues
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const {title, code, description, visibility, tags } = validationResult.data;

        const tagObjects = tags ? await Promise.all(
            tags.map(async (tagName) => {
                return await prisma.tag.upsert({
                    where: { id: tagName }, // Using id as the unique identifier
                    update: {},
                    create: { name: tagName },
                });
            })
        ) : [];

        const snippet = await prisma.snippet.create({
            data: {
                title,
                code,
                description,
                visibility: visibility || "public",
                user_id: userId,
                tags: {
                    create: tagObjects.map((tag) => ({
                        tag_id: tag.id
                    }))
                },
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Snippet created successfully",
                data: snippet,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error creating snippet:", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                message: "Error while creating snippet",
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}