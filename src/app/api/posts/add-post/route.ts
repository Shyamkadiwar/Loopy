import { uploadImage } from '@/lib/uploadImage'
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const postSchema = z.object({
  description: z.string().min(3, "Minimum 3 character required"),
  // For base64 encoded images
  images: z.array(z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/))
    .optional()
    .default([]),
  links: z.array(z.string().url()).optional().default([]),
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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const body = {
      description: formData.get('description'),
      images: formData.getAll('images').map(img => img.toString()),
      links: formData.getAll('links').map(link => link.toString()),
    };

    const result = postSchema.safeParse(body);

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

    const { description, images, links } = result.data;

    // Upload images to Cloudinary
    let uploadedImages: string[] = [];
    if (images.length > 0) {
      try {
        const uploadPromises = images.map(image => uploadImage(image));
        uploadedImages = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading images:", error);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error uploading images",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        user_id: userId,
        description,
        images: uploadedImages,
        links,
      },
    });

    if (!post) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error while adding post",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        reputation_points: {
          increment: 2,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post added successfully",
        data: post,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error while adding post:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}