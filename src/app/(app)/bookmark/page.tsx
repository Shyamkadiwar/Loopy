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
    created_at: string;
    tags?: string[];
    _count?: {
        comments?: number;
        votes?: number;
        answers?: number;
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
    message: string;
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetchBookmarks();
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status]);

    async function fetchBookmarks(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse>("/api/bookmark/get-bookmark");
            if (response.data.success) {
                setBookmarks(response.data.data);
            } else {
                setError(response.data.message || "Failed to fetch bookmarks");
            }
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            setError("An error occurred while fetching your bookmarks");
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

    const filteredBookmarks = bookmarks[activeTab] ? bookmarks[activeTab].filter(item => {
        const searchText = searchQuery.toLowerCase();
        return (
            (item.title && item.title.toLowerCase().includes(searchText)) ||
            (item.description && item.description.toLowerCase().includes(searchText))
        );
    }) : [];

    const renderTags = (tags?: string[]) => {
        if (!tags || tags.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-800 rounded-full text-gray-300">
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen w-screen bg-[#0a090f] justify-center items-center">
                <p className="text-white">Loading...</p>
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
                                    {bookmarks[tab] && bookmarks[tab].length > 0 && (
                                        <span className="ml-2 px-2 py-1 bg-gray-800 rounded-full text-sm">
                                            {bookmarks[tab].length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <p className="text-white">Loading...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-10">
                                    <p className="text-red-400">{error}</p>
                                    <Button 
                                        onClick={fetchBookmarks} 
                                        className="mt-4 bg-gray-800 hover:bg-gray-700"
                                    >
                                        Try Again
                                    </Button>
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
                                                {item.title || (item.description ? item.description.substring(0, 50) + "..." : "Untitled")}
                                            </h3>
                                            {item.tags && renderTags(item.tags)}
                                            {item._count && (
                                                <div className="mt-2 text-gray-400 text-sm flex space-x-4">
                                                    {item._count.comments !== undefined && (
                                                        <span>{item._count.comments} comment{item._count.comments !== 1 ? 's' : ''}</span>
                                                    )}
                                                    {item._count.votes !== undefined && (
                                                        <span>{item._count.votes} vote{item._count.votes !== 1 ? 's' : ''}</span>
                                                    )}
                                                    {item._count.answers !== undefined && (
                                                        <span>{item._count.answers} answer{item._count.answers !== 1 ? 's' : ''}</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="mt-2 text-gray-500 text-sm">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
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