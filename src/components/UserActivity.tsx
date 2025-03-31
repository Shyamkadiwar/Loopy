"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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

interface UserActivityProps {
    userId: string;
    allContent: UserContent | null;
}

// Define the tab type for better type safety
type ActivityTab = 'posts' | 'comments' | 'answers' | 'questions' | 'snippets' | 'articles';

const UserActivity = ({ userId, allContent }: UserActivityProps) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<ActivityTab>('posts');
    const [userContent, setUserContent] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
                    fetchComments();
                    break;
                default:
                    setUserContent([]);
            }
        }
    }, [activeTab, allContent]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/profile/get-user-comments/${userId}`);
            if (response.data.success) {
                setUserContent(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            setUserContent([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: ActivityTab) => {
        setActiveTab(tab);
    };

    const navigateToContent = (contentId: string, contentType: string) => {
        const routeMap: Record<string, string> = {
            posts: '/post/',
            answers: '/questions/question',
            questions: '/questions/question',
            snippets: '/snippets/snippet',
            articles: '/articles/article'
        };
        
        const basePath = routeMap[contentType] || '/';
        router.push(`${basePath}/${contentId}`);
    };

    const tabs: ActivityTab[] = ['posts', 'questions', 'answers', 'snippets', 'articles'];

    return (
        <div>
            {/* User Activity Tabs Component */}
            <div className="mt-6">
                <div className="flex justify-between overflow-x-auto">
                    {tabs.map((tab) => (
                        <button 
                            key={tab}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content List Component */}
                <div className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <p className="text-white">Loading...</p>
                        </div>
                    ) : !userContent ? (
                        <div className="flex justify-center py-10">
                            <p className="text-white">Loading...</p>
                        </div>
                    ) : userContent.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No {activeTab} found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Content Item Component - Mapped for each item */}
                            {userContent.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="border border-[#353539] rounded-lg p-4 hover:bg-[#141317] cursor-pointer" 
                                    onClick={() => navigateToContent(item.id, activeTab)}
                                >
                                    <div className="flex justify-between">
                                        <h3 className="text-white font-medium">
                                            {item.title || 
                                             item.description || 
                                             item.answer_text || 
                                             item.comment_text || 
                                             (item.code && item.code.substring(0, 60) + '...') || 
                                             'Untitled'}
                                        </h3>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(item.created_at).toLocaleDateString('en-GB', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    {item.answer_text && item.question && (
                                        <div>
                                            <p className="text-xs text-blue-400 mt-1">On question: {item.question.title}</p>
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
    );
};

export default UserActivity;