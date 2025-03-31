import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from 'zod'
import { useParams } from "next/navigation";

const articleSchema = z.object({
    title: z.string().min(3, "Minimum 3 character required"),
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string()).optional().default([]),
    links: z.array(z.string()).optional().default([])
})

export async function article(request: Request){
    try {
        const params = useParams<{ articleId: string }>();
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
        const result = articleSchema.safeParse(body)
        if(!result.success){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Invalid input data",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        const {title, description, images, links} = result.data
        const articleId = params.articleId

        const newArticle = await prisma.article.update({
            where : {id : articleId},
            data : {
                title,
                description,
                links,
                images
            }
        })

        if(!newArticle){
            return new Response(
                JSON.stringify({
                  success: false,
                  message: "Error while updating article details",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
              success: true,
              message: "successfully updated article",
              data : newArticle
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error while updating article:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Internal server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}