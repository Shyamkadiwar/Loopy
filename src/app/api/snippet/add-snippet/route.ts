import prisma from "@/lib/prisma";
import { z } from "zod";

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
        // Safely parse the request body
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

        // Validate request data
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

        const { email, title, code, description, visibility, tags } = validationResult.data;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
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

        // First, ensure all tags exist
        const tagObjects = tags ? await Promise.all(
            tags.map(async (tagName) => {
                return await prisma.tag.upsert({
                    where: { id: tagName }, // Using id as the unique identifier
                    update: {},
                    create: { name: tagName },
                });
            })
        ) : [];

        // Create the snippet with tags
        const snippet = await prisma.snippet.create({
            data: {
                title,
                code,
                description,
                visibility: visibility || "public",
                user_id: user.id,
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