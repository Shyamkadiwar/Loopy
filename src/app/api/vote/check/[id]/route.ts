import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { useParams } from "next/navigation";

export async function GET(request: Request) {
    try {
        const params = useParams<{ id: string }>();
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new Response(JSON.stringify({ success: false, message: "User not authenticated" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userVote = await prisma.vote.findFirst({
            where: {
                user_id: session.user.id,
                voteable_id: params.id
            },
            select: { vote_type: true },
        });

        return new Response(JSON.stringify({ success: true, vote_type: userVote?.vote_type || null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error while checking vote:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
