import { uploadImage } from '@/lib/uploadImage';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(3, "Minimum 3 characters required"),
  description: z.string().min(3, "Minimum 3 characters required"),
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
        JSON.stringify({ success: false, message: "User not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    
    const body = {
      title: formData.get('title'),
      description: formData.get('description'),
      images: formData.getAll('images').map(img => img.toString()),
      links: formData.getAll('links').map(link => link.toString()),
    };

    const result = articleSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid input data", errors: result.error.format() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { title, description, images, links } = result.data;

    // Upload images to Cloudinary
    let uploadedImages: string[] = [];
    if (images.length > 0) {
      try {
        const uploadPromises = images.map(image => uploadImage(image));
        uploadedImages = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading images:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Error uploading images" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Create Article
    const article = await prisma.article.create({
      data: {
        user_id: userId,
        title,
        description,
        images: uploadedImages,
        links,
      },
    });

    if (!article) {
      return new Response(
        JSON.stringify({ success: false, message: "Error while adding article" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Increment Reputation Points
    await prisma.user.update({
      where: { id: userId },
      data: { reputation_points: { increment: 2 } },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Article added successfully", data: article }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error while adding article:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
