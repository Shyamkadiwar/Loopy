import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

const commentSchema = z.object({
  comment_text: z.string().min(2, "Minimum 2 characters required"),
  commentable_type: z.literal("Snippet"),
});

export async function POST( request: Request, { params }: { params: { snippetId: string } }){
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Not authenticated",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const result = commentSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid input data",
          errors: result.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { comment_text, commentable_type } = result.data;

    const { snippetId } = params;

    if (!snippetId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Snippet ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;

    const comment = await prisma.comment.create({
      data: {
        comment_text: comment_text,
        commentable_type: commentable_type,
        commentable_id : snippetId,
        snippetId: snippetId,
        user_id: userId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Comment added successfully",
        data: comment,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error while adding comment:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}