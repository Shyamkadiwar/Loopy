import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from 'zod'

const snippetSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().min(1, "Description is required"),
    visibility: z.enum(["public", "private", "shared"]).optional().default("public"),
    tags: z.array(z.string()).optional()
});

export async function POST(request: Request){
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
        const result = snippetSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const {title, code, description, visibility} = result.data
        const url = new URL(request.url);
        const snippetId = url.pathname.split("/").pop();

        if (!snippetId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "snippet ID is required",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const newSnippet = await prisma.snippet.update({
            where : {id : snippetId},
            data : {
                title: title,
                code: code,
                description: description,
                visibility: visibility
            }
        })

        if(!newSnippet){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating snippet details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
              success: true,
              message: "successfully updated snippet",
              data : newSnippet
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while updating snippet:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}