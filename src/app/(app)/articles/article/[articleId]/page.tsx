"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Search, Bookmark } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import Comments from "@/components/Comments";
import AddComment from "@/components/AddComment";
import { Input } from "@/components/ui/input";
import ProfileDropdown from "@/components/ProfileDropdown";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface ArticleDetail {
  id: string;
  title: string;
  user: { id: string; name: string; email: string; username: string, image: string };
  description: string;
  images: string[];
  links: string[];
  comments: { comment_text: string; user: { id: string, username: string; name: string; image: string | null } }[];
  _count: { comments: number };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

interface Comment {
  id: string;
  comment_text: string;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}


export default function ArticleDetail({ params }: { params: { articleId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState<boolean>(false);

  const getArticleDetail = async () => {
    try {
      const response = await axios.get(`/api/articles/get-specific-article/${params.articleId}`);
      if (response.data.success) {
        setArticle(response.data.data);
        setFetchError(null);
      } else {
        setFetchError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
      setFetchError("Failed to load article details. Please try again later.");
    }
  };

  const checkUserVote = async () => {
    if (!session) return;

    try {
      const response = await axios.get(`/api/vote/check/${params.articleId}`);
      if (response.data.success) {
        setUserVote(response.data.vote_type);
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!session) return;

    try {
      const response = await axios.get(`/api/bookmark/check`, {
        params: {
          itemId: params.articleId,
          itemType: "article"
        }
      });

      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  useEffect(() => {
    getArticleDetail();
    checkUserVote();
    checkBookmarkStatus();
  }, [params.articleId]);

  async function handleVote(articleId: string, newVoteType: "upvote" | "downvote") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingVote) return;
    setIsProcessingVote(true);

    try {
      if (userVote === newVoteType) {
        const response = await axios.delete(`/api/vote/remove-article-vote/${articleId}`);
        if (response.data.success) {
          setArticle((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              upVoteCount: newVoteType === "upvote" ? prev.upVoteCount - 1 : prev.upVoteCount,
              downVoteCount: newVoteType === "downvote" ? prev.downVoteCount - 1 : prev.downVoteCount,
            };
          });
          setUserVote(null);
        }
      } else {
        const response = await axios.post(`/api/vote/add-article-vote/${articleId}`, {
          vote_type: newVoteType,
          voteable_type: "Article"
        });

        if (response.data.success) {
          setArticle((prev) => {
            if (!prev) return prev;

            let upCount = prev.upVoteCount;
            let downCount = prev.downVoteCount;

            if (userVote === "upvote") upCount--;
            if (userVote === "downvote") downCount--;

            if (newVoteType === "upvote") upCount++;
            if (newVoteType === "downvote") downCount++;

            return {
              ...prev,
              upVoteCount: upCount,
              downVoteCount: downCount,
            };
          });
          setUserVote(newVoteType);
        }
      }
    } catch (error) {
      console.error("Error processing vote:", error);
    } finally {
      setIsProcessingVote(false);
    }
  }

  async function handleBookmark() {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingBookmark || !article) return;
    setIsProcessingBookmark(true);

    try {
      if (isBookmarked) {
        const response = await axios.delete(`/api/bookmark/remove`, {
          data: {
            itemId: article.id,
            itemType: "article"
          }
        });

        if (response.data.success) {
          setIsBookmarked(false);
          toast({
            title: "Bookmark removed",
            description: "Article removed from your bookmarks",
          });
        }
      } else {
        const response = await axios.post(`/api/bookmark/add-bookmark`, {
          itemId: article.id,
          itemType: "article"
        });

        if (response.data.success) {
          setIsBookmarked(true);
          toast({
            title: "Bookmark added",
            description: "Article added to your bookmarks",
          });
        }
      }
    }
    catch (error) {
      if (error instanceof Error) {
        const errorResponse = axios.isAxiosError(error) ?
          error.response?.data?.message : 'Unknown error';

        if (errorResponse === "Already bookmarked") {
          toast({
            title: "Already bookmarked",
            description: "This article is already in your bookmarks",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to process bookmark",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }

    finally {
      setIsProcessingBookmark(false);
    }
  }

  if (status === "loading" || !article) {
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

  if (fetchError) {
    return (
      <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
        <div className="text-white text-xl text-center">
          {fetchError}
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
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 text-lg border-[1px] border-[#353539] text-white"
              aria-label="Search posts"
            />
          </div>
          <div className="flex justify-center items-center gap-10">
            <Button onClick={() => router.back()} variant="ghost" className="text-white text-sm flex items-center gap-2 border-[#353539] border-[1px]">
              <ArrowLeft className="h-5 w-5" />
              Back to articles
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>
        <div className="max-w-4xl mx-auto py-6 px-4">


          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            <div className="pb-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.user.image || ''} alt={article.user.name || 'User'} />
                    <AvatarFallback>{article.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Link
                      href={`/user/${article.user.id}`}
                      className="text-white font-space-grotesk"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{article.user.username}
                    </Link>
                    <p className="text-sm text-gray-400 font-space-grotesk">{article.user.name}</p>
                  </div>
                </div>
                <p className="text-white text-xs">
                  {new Date(article.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-white text-2xl">{article.title}</h1>
              <p className="text-white">{article.description}</p>
              {article.images && article.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.images.map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {article.links && article.links.length > 0 && (
                <div className="bg-[#1a191f] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Related Links</h3>
                  <ul className="space-y-2">
                    {article.links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 py-4">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => handleVote(article.id, "upvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{article.upVoteCount}</span>
                </Button>
                <Button
                  onClick={() => handleVote(article.id, "downvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{article.downVoteCount}</span>
                </Button>
                <Button
                  onClick={handleBookmark}
                  disabled={isProcessingBookmark}
                  className="flex items-center gap-1"
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? "text-white fill-white" : "text-gray-400"}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{article._count.comments} comments</span>
              </div>
            </div>



            <AddComment
              contentId={article.id}
              commentOn="article"
              commentableType="Article"
              onCommentAdded={(newComment) =>
                setArticle((prev) =>
                  prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
                )
              }

            />
            <Comments comments={article.comments} />
          </Card>
        </div>
      </div>
    </div>
  );
}