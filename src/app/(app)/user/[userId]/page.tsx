"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetail {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string;
    bio: string;
    reputation_points: number;
    created_at: string;
    interest: string;
    links: string[];
    counts: {
        snippets: number;
        comments: number;
        answers: number;
        questions: number;
    };
}

export default function UserProfile({ params }: { params: { userId: string } }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getUserDetail();
    }, [params.userId]);

    async function getUserDetail() {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/profile/get-selected-user/${params.userId}`);
            if (response.data.success) {
                setUser(response.data.data);
                setError(null);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            setError("Failed to load user details. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
                <div className="text-white text-xl text-center">Loading...</div>
            </div>
        );
    }

    if (!session) {
        router.push("/signin");
        return null;
    }

    if (error) {
        return (
            <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
                <div className="text-white text-xl text-center">
                    <p>{error}</p>
                    <Button onClick={() => router.back()} variant="outline" className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
            <AppSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="flex p-4 justify-between items-center border-b-[1px] border-[#353539] sticky top-0 bg-[#0a090f] z-10">
                    <div className="relative w-1/3">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                        <Input type="text" placeholder="Search" className="pl-10 text-lg border-[1px] border-[#353539] text-white" aria-label="Search users" />
                    </div>
                    <div className="flex justify-center items-center gap-10">
                        <Button onClick={() => router.back()} variant="ghost" className="text-white text-sm flex items-center gap-2 border-[#353539] border-[1px]">
                            <ArrowLeft className="h-5 w-5" />
                            Back
                        </Button>
                        <ProfileDropdown user={session?.user} />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto py-6 px-4">
                    {user && (
                        <Card className="p-6 border-0 bg-[#0a090f]">
                            <div className="pb-4">
                                <div className="flex gap-6 justify-center items-center">
                                    <div>
                                        <Avatar className="w-20 h-20">
                                            <AvatarImage src={user?.image || ""} alt="Profile" />
                                            <AvatarFallback>
                                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <h1 className="text-white text-xl">{user.name}</h1>
                                        <h1 className="text-gray-400 text-xl">@{user.username}</h1>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                <p className="text-gray-400 text-sm">Reputation Points: {user.reputation_points}</p>
                                {user.interest && (
                                    <p className="text-gray-400 text-sm mt-1">Interest: {user.interest}</p>
                                )}
                                {user.bio && (
                                    <p className="text-gray-400 mt-2">{user.bio}</p>
                                )}
                            </div>
                            {user.links && user.links.length > 0 && (
                                <div className="bg-[#1a191f] p-4 rounded-lg mt-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">Links</h3>
                                    <ul className="space-y-2">
                                        {user.links.map((link, index) => (
                                            <li key={index}>
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-4 text-gray-400">
                                <p>Snippets: {user.counts.snippets}</p>
                                <p>Comments: {user.counts.comments}</p>
                                <p>Answers: {user.counts.answers}</p>
                                <p>Questions: {user.counts.questions}</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}