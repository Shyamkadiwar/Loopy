"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

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

interface BookmarkData {
    snippets: ContentItem[];
    questions: ContentItem[];
    posts: ContentItem[];
    articles: ContentItem[];
}

interface ApiResponse {
    success: boolean;
    data: BookmarkData;
}

type ContentType = "snippets" | "posts" | "questions" | "articles";

const BookmarkPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<BookmarkData>({
        snippets: [],
        posts: [],
        questions: [],
        articles: []
    });
    const [activeTab, setActiveTab] = useState<ContentType>("snippets");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        fetchBookmarks();
    }, []);

    async function fetchBookmarks(): Promise<void> {
        setIsLoading(true);
        try {
            const response = await axios.get<ApiResponse>("/api/bookmark/get-bookmark");
            if (response.data.success) {
                setBookmarks(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleTabChange = (tab: ContentType): void => {
        setActiveTab(tab);
    };

    const navigateToContent = (contentId: string, contentType: ContentType): void => {
        const routeMap: Record<ContentType, string> = {
            snippets: "/snippets/snippet",
            posts: "/post",
            questions: "/questions/question",
            articles: "/articles/article"
        };
        router.push(`${routeMap[contentType]}/${contentId}`);
    };

    // Add a safety check to prevent the "Cannot read properties of undefined" error
    const filteredBookmarks = bookmarks[activeTab] ? bookmarks[activeTab].filter(item => 
        item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    return (
        <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
            <AppSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="flex p-4 justify-between items-center border-b-[1px] border-[#353539] sticky top-0 bg-[#0a090f] z-10">
                    <div className="relative w-1/3">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                        <Input 
                            type="text" 
                            placeholder="Search" 
                            className="pl-10 text-lg border-[1px] border-[#353539] text-white" 
                            aria-label="Search bookmarks" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                    <Card className="p-6 border-0 bg-[#0a090f]">
                        <div className="flex space-x-4">
                            {(["snippets", "posts", "questions", "articles"] as ContentType[]).map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-3 text-lg font-medium ${activeTab === tab ? "text-white border-b-2 border-white" : "text-gray-400"}`}
                                    onClick={() => handleTabChange(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <p className="text-white">Loading...</p>
                                </div>
                            ) : !bookmarks[activeTab] || bookmarks[activeTab].length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400">No {activeTab} bookmarked</p>
                                </div>
                            ) : filteredBookmarks.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400">No {activeTab} match your search</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBookmarks.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border border-[#353539] rounded-lg p-4 hover:bg-[#141317] cursor-pointer"
                                            onClick={() => navigateToContent(item.id, activeTab)}
                                        >
                                            <h3 className="text-white font-medium">
                                                {item.title || "Untitled"}
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookmarkPage;