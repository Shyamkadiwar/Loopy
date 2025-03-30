"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import Comments from "@/components/Comments";
import AddComment from "@/components/AddComment";
import { Input } from "@/components/ui/input";
import ProfileDropdown from "@/components/ProfileDropdown";
import Link from "next/link";

interface ArticleDetail {
  id: string;
  title: string;
  user: { id: string; name: string; email: string; username: string };
  description: string;
  images: string[];
  links: string[];
  comments: { comment_text: string; user: { id: string, username: string; name: string; image: string | null } }[];
  _count: { comments: number };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

export default function ArticleDetail({ params }: { params: { articleId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);

  useEffect(() => {
    getArticleDetail();
    checkUserVote();
  }, [params.articleId]);

  async function getArticleDetail() {
    try {
      const response = await axios.get(`/api/articles/get-specific-article/${params.articleId}`);
      if (response.data.success) {
        setArticle(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
      setError("Failed to load article details. Please try again later.");
    }
  }

  async function checkUserVote() {
    if (!session) return;

    try {
      const response = await axios.get(`/api/vote/check/${params.articleId}`);
      if (response.data.success) {
        setUserVote(response.data.vote_type); // "upvote" or "downvote"
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  }

  async function handleVote(articleId: string, newVoteType: "upvote" | "downvote") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingVote) return;
    setIsProcessingVote(true);

    try {
      if (userVote === newVoteType) {
        // Remove vote if clicking the same type
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
        // Add or update vote
        const response = await axios.post(`/api/vote/add-article-vote/${articleId}`, {
          vote_type: newVoteType,
          voteable_type: "Article"
        });

        if (response.data.success) {
          setArticle((prev) => {
            if (!prev) return prev;

            let upCount = prev.upVoteCount;
            let downCount = prev.downVoteCount;

            // Remove old vote count if exists
            if (userVote === "upvote") upCount--;
            if (userVote === "downvote") downCount--;

            // Add new vote count
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
                  <Link
                    href={`/user/${article.user.id}`}
                    className="text-white font-space-grotesk"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{article.user.username}
                  </Link>
                  <p className="text-sm text-gray-400 font-space-grotesk">{article.user.name}</p>
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
              <div className="flex items-center ml-4 justify-between mt-6 py-4">
                <div className="flex items-center gap-6">
                  <Button
                    onClick={() => handleVote(article.id, "upvote")}
                    disabled={isProcessingVote}
                    className={`flex items-center gap-1"
                      }`}
                  >
                    <ThumbsUp className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"
                      }`} />
                    <span>{article.upVoteCount}</span>
                  </Button>
                  <Button
                    onClick={() => handleVote(article.id, "downvote")}
                    disabled={isProcessingVote}
                    className={`flex items-center gap-1"
                      }`}
                  >
                    <ThumbsDown className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"
                      }`} />
                    <span>{article.downVoteCount}</span>
                  </Button>
                </div>
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
              onCommentAdded={(newComment) => setArticle((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev)}
            />
            <Comments comments={article.comments} />
          </Card>
        </div>
      </div>
    </div>
  );
}
