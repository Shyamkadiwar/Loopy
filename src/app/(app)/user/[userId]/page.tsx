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
    name: string;
    username: string;
    email: string;
    image: string;
    bio: string;
    reputation_points: number;
    created_at: string;
    interest: string[];
    links: any;
    counts: {
        snippets: number;
        comments: number;
        answers: number;
        questions: number;
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

export default function UserProfile({ params }: { params: { userId: string } }) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'answers' | 'questions' | 'snippets' | 'articles'>('posts');
    const [userContent, setUserContent] = useState<ContentItem[]>([]);
    const [allContent, setAllContent] = useState<UserContent | null>(null);

    useEffect(() => {
        getUserDetail();
    }, [params.userId]);

    useEffect(() => {
        if (allContent) {
            switch (activeTab) {
                case 'posts':
                    setUserContent(allContent.posts || []);
                    break;
                case 'answers':
                    setUserContent(allContent.answers || []);
                    break;
                case 'questions':
                    setUserContent(allContent.questions || []);
                    break;
                case 'snippets':
                    setUserContent(allContent.snippets || []);
                    break;
                case 'articles':
                    setUserContent(allContent.articles || []);
                    break;
                case 'comments':
                    // Comments may need a separate fetch since they weren't included in the API response
                    fetchComments();
                    break;
                default:
                    setUserContent([]);
            }
        }
    }, [activeTab, allContent]);

    async function getUserDetail() {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/profile/get-selected-user/${params.userId}`);
            if (response.data.success) {
                const userData = response.data.data;
                setUser({
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

    // Function to fetch comments separately if needed
    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/profile/get-user-comments/${params.userId}`);
            if (response.data.success) {
                setUserContent(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            setUserContent([]);
        }
    };

    // Function to handle tab changes
    const handleTabChange = (tab: 'posts' | 'comments' | 'answers' | 'questions' | 'snippets' | 'articles') => {
        setActiveTab(tab);
    };

    // Function to navigate to specific content item
    const navigateToContent = (contentId: string, contentType: string) => {
        // Map each tab to its corresponding route
        const routeMap: Record<string, string> = {
            posts: '/posts',
            comments: '/posts', // Assuming comments will navigate to the post they belong to
            answers: '/questions',
            questions: '/questions',
            snippets: '/snippets',
            articles: '/articles'
        };
        
        const basePath = routeMap[contentType] || '/';
        router.push(`${basePath}/${contentId}`);
    };

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
        // TODO: formatting UI
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
                            {/* head */}
                            <div className="pb-4 flex">
                                <div className="w-1/2 flex gap-6 justify-normal items-center">
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
                                        <h1 className="text-white text-lg">@{user.username}</h1>
                                    </div>
                                </div>
                                <div className="pl-16 pt-3 font-thin">
                                    <p className="text-white text-xs">Joined: {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>

                                    <p className="text-white text-xs">Reputation Points: <span className="font-bold">{user.reputation_points}</span></p>
                                    {user.interest && user.interest.length > 0 && (
                                        <p className="text-white text-xs">Interest: {user.interest.join(', ')}</p>
                                    )}
                                </div>
                            </div>

                            {/* bio */}
                            <div className="">
                                {user.bio && (
                                    <p className="text-gray-400 text-base">{user.bio}</p>
                                )}
                            </div>

                            {user.links && Object.keys(user.links).length > 0 && (
                                <div className="bg-[#1a191f] p-4 rounded-lg mt-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">Links</h3>
                                    <ul className="space-y-2">
                                        {Object.entries(user.links).map(([key, value], index) => (
                                            <li key={index}>
                                                <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                    {key}: {value as string}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* stats */}
                            <div className="pt-8 flex justify-between items-center text-gray-400">
                                <p className="text-sm">Snippets: {user.counts.snippets}</p>
                                <p className="text-sm">Comments: {user.counts.comments}</p>
                                <p className="text-sm">Answers: {user.counts.answers}</p>
                                <p className="text-sm">Questions: {user.counts.questions}</p>
                            </div>

                            <div className="border-b-[1px] border-[#353539] pt-4 pb-4"></div>

                            <div>
                                {/* User Activity Tabs */}
                                <div className="mt-6">
                                    <div className="flex border-b border-[#353539] overflow-x-auto">
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'posts' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('posts')}
                                        >
                                            Posts
                                        </button>
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'comments' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('comments')}
                                        >
                                            Comments
                                        </button>
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'answers' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('answers')}
                                        >
                                            Answers
                                        </button>
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'questions' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('questions')}
                                        >
                                            Questions
                                        </button>
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'snippets' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('snippets')}
                                        >
                                            Snippets
                                        </button>
                                        <button 
                                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'articles' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                                            onClick={() => handleTabChange('articles')}
                                        >
                                            Articles
                                        </button>
                                    </div>

                                    <div className="mt-6">
                                        {!userContent ? (
                                            <div className="flex justify-center py-10">
                                                <p className="text-white">Loading...</p>
                                            </div>
                                        ) : userContent.length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No {activeTab} found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {userContent.map((item) => (
                                                    <div key={item.id} className="border border-[#353539] rounded-lg p-4 hover:bg-[#1a191f] cursor-pointer" onClick={() => navigateToContent(item.id, activeTab)}>
                                                        <div className="flex justify-between">
                                                            <h3 className="text-white font-medium">
                                                                {item.title || 
                                                                 item.description || 
                                                                 item.answer_text || 
                                                                 item.comment_text || 
                                                                 (item.code && item.code.substring(0, 60) + '...') || 
                                                                 'Untitled'}
                                                            </h3>
                                                            <p className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        
                                                        {/* {item.description && (
                                                            <p className="text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                                                        )}
                                                         */}
                                                        {item.answer_text && (
                                                            <div>
                                                                {/* <p className="text-gray-400 mt-2 line-clamp-2">{item.answer_text}</p> */}
                                                                {item.question && (
                                                                    <p className="text-xs text-blue-400 mt-1">On question: {item.question.title}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {activeTab === 'snippets' && item.tags && item.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {item.tags.map((tagItem, idx) => (
                                                                    <span key={idx} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                                                                        {tagItem.tag.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {item._count && (
                                                            <div className="mt-2 flex gap-4">
                                                                {item._count.comments !== undefined && (
                                                                    <span className="text-xs text-gray-400">Comments: {item._count.comments}</span>
                                                                )}
                                                                {item._count.votes !== undefined && (
                                                                    <span className="text-xs text-gray-400">Votes: {item._count.votes}</span>
                                                                )}
                                                                {item._count.answers !== undefined && (
                                                                    <span className="text-xs text-gray-400">Answers: {item._count.answers}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}