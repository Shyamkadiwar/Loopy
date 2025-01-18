import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const {name, email, password} = await request.json()
        const existingUser = await prisma.user.findUnique({
            where: {email: email}
        })
        if(existingUser){
            return Response.json({
                success : false,
                message : "User already exists. Please sign in."
            },{status:400})
        }

        const saltRounds = 20;
        const hasedPassword = await bcrypt.hash(password, saltRounds)

        const newUser = await prisma.user.create({
            data:{
                name : name,
                email : email,
                password_hash : hasedPassword,

            }
        })

        if(!newUser){
            return Response.json({
                success : false,
                message : "Something went wrong while creating user"
            },{status:500})
        }

        return Response.json({
            success : true,
            message : "User register successfully"
        },{status:500})


    }
    catch (error) {
        console.log("Error creating user: ", error);
        return Response.json({
            success : false,
            message : "Something went wrong while creatinh user"
        },{status:500})
    }
}