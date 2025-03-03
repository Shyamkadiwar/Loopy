"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import Comments from "@/components/Comments";
import AddComment from "@/components/AddComment";

interface ArticleDetail {
  id: string;
  title: string;
  user: { name: string; email: string; username: string };
  description: string;
  images: string[];
  links: string[];
  comments: { comment_text: string; user: { name: string; image: string | null } }[];
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

  async function addComment(commentable_type: string) {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await axios.post(`/api/comments/add-article-comment/${article?.id}`, { comment_text: commentText, commentable_type });

      if (response.data.success) {
        // Create a new comment object with the returned data
        const newComment = {
          id: response.data.data.id,
          comment_text: response.data.data.comment_text,
          user: {
            name: session.user?.name || "Anonymous",
            image: session.user?.image || null
          }
        };

        // Update the post state with the new comment
        setArticle((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            comments: [...prev.comments, newComment],
            _count: {
              ...prev._count,
              comments: prev._count.comments + 1
            }
          };
        });

        // Clear the comment input
        setCommentText("");
      }
    } catch (error) {
      console.error("Error while adding comment to post:", error);
      setError("Failed to add comment. Please try again later.");
    } finally {
      setIsSubmittingComment(false);
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
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Button onClick={() => router.back()} variant="ghost" className="text-white text-sm mb-6 flex items-center gap-2 border-[#353539] border-[1px]">
            <ArrowLeft className="h-5 w-5" />
            Back to articles
          </Button>

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            <div className="pb-4">
              <div className="flex gap-3 mb-6">
                <p className="text-sm text-gray-400">@{article.user.username}</p>
                <p className="text-sm text-gray-400">{article.user.name}</p>
              </div>
              <p className="text-sm text-gray-400">{new Date(article.created_at).toLocaleDateString()}</p>
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
