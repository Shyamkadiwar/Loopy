"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

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
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);

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

  async function addVote(articleId: string, vote_type: "upvote" | "downvote", voteable_type:string) {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (userVote === vote_type) return; // Prevent double voting

    try {
      const response = await axios.post(`/api/vote/add-article-vote/${articleId}`, { vote_type, voteable_type });

      if (response.data.success) {
        setUserVote(vote_type);

        setArticle((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            upVoteCount: vote_type === "upvote" ? prev.upVoteCount + 1 : prev.upVoteCount,
            downVoteCount: vote_type === "downvote" ? prev.downVoteCount + 1 : prev.downVoteCount,
          };
        });
      }
    } catch (error) {
      console.error("Error while adding vote to article:", error);
      setError("Failed to cast vote. Please try again later.");
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
            </div>

            <div className="flex items-center justify-between mt-6 py-4">
              <div className="flex items-center gap-6">
                <Button onClick={() => addVote(article.id, "upvote", "Article")} className="flex items-center gap-1">
                  <ThumbsUp
                    className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"}`}
                  />
                  <span>{article.upVoteCount}</span>
                </Button>
                <Button onClick={() => addVote(article.id, "downvote", "Article")} className="flex items-center gap-1">
                  <ThumbsDown
                    className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"}`}
                  />
                  <span>{article.downVoteCount}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{article._count.comments} comments</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
