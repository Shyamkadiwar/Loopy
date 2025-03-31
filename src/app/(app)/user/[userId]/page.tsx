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
import UserActivity from "@/components/UserActivity";
import UserProfileCard from "@/components/UserProfileCard";
import { useParams } from "next/navigation";

interface UserDetail {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string;
    bio: string;
    reputation_points: number;
    created_at: string;
    interest: string[];
    links: Record<string, string>;
    counts: {
        snippets: number;
        comments: number;
        answers: number;
        questions: number;
        posts: number;
        articles: number;
    };
}

interface ContentItem {
    id: string;
    title?: string;
    description?: string;
    code?: string;
    answer_text?: string;
    comment_text?: string;
    created_at: string;
    tags?: Array<{tag: {name: string}}>;
    _count?: {
        comments?: number;
        votes?: number;
        answers?: number;
    };
    question?: {
        id: string;
        title: string;
    };
}

interface UserContent {
    snippets: ContentItem[];
    questions: ContentItem[];
    answers: ContentItem[];
    posts: ContentItem[];
    articles: ContentItem[];
}

export default function UserProfile() {
    const params = useParams<{ userId: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allContent, setAllContent] = useState<UserContent | null>(null);

    useEffect(() => {
        getUserDetail();
    }, [params.userId]);

    async function getUserDetail() {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/profile/get-selected-user/${params.userId}`);
            if (response.data.success) {
                const userData = response.data.data;
                setUser({
                    id: userData.id,
                    name: userData.name,
                    username: userData.username,
                    email: userData.email,
                    image: userData.image,
                    bio: userData.bio,
                    reputation_points: userData.reputation_points,
                    created_at: userData.created_at,
                    interest: userData.interest,
                    links: userData.links,
                    counts: userData.counts
                });
                setAllContent(userData.content);
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

    // Check if the current user is the profile owner
    const isProfileOwner = session?.user?.id === user?.id;

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
                            {/* Pass isProfileOwner to UserProfileCard */}
                            <UserProfileCard 
                                user={user} 
                                isProfileOwner={isProfileOwner} 
                            />
                            
                            {/* UserActivity Component */}
                            {allContent && (
                                <UserActivity 
                                    userId={params.userId} 
                                    allContent={allContent} 
                                />
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}