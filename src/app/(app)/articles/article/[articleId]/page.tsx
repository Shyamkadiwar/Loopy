"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

interface articleDetail {
  id: string;
  title: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  description: string;
  images: string[];
  links: string[];
  comments: {
    comment_text: string;
    user: {
      name: string;
      image: string | null;
    };
  }[];
  _count: {
    comments: number;
  };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

export default function articleDetail({ params }: { params: { articleId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [article, setarticle] = useState<articleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getarticleDetail();
  }, [params.articleId]);

  async function getarticleDetail() {
    try {
      const response = await axios.get(`/api/articles/get-specific-article/${params.articleId}`);
      if (response.data.success) {
        setarticle(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
      setError("Failed to load article details. Please try again later.");
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
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="text-white text-sm mb-6 flex items-center gap-2 border-[#353539] border-[1px]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to articles
          </Button>

          <Card className="p-6 borderz-[1px] font-space-grotesk border-[#353539] bg-[#0a090f]">
            {/* article Header */}
            <div className="border-b border-[#353539] pb-4 mb-6">
              <h1 className="text-2xl font-bold text-white mb-4">{article.title}</h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{article.user.username}</p>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-400">{article.user.name}</p>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* article Content */}
            <div className="space-y-6">
              <p className="text-white whitespace-pre-wrap">{article.description}</p>

              {article.images && article.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.images.map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                      <img 
                        src={image} 
                        alt={`article image ${index + 1}`} 
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

            {/* Interaction Section */}
            <div className="flex items-center justify-between mt-6 py-4 border-t border-[#353539]">
              <div className="flex items-center gap-6">
                <Button variant="ghost" className="flex items-center gap-1">
                  <ThumbsUp className="h-5 w-5" />
                  <span>{article.upVoteCount}</span>
                </Button>
                <Button variant="ghost" className="flex items-center gap-1">
                  <ThumbsDown className="h-5 w-5" />
                  <span>{article.downVoteCount}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{article._count.comments} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
              <div className="space-y-4">
                {article.comments.map((comment, index) => (
                  <Card key={index} className="p-4 border-[1px] border-[#353539] bg-[#0a090f]">
                    <div className="flex items-start gap-3">
                      {comment.user.image ? (
                        <img 
                          src={comment.user.image} 
                          alt={comment.user.name} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#353539] flex items-center justify-center">
                          <span className="text-white text-sm">
                            {comment.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white mb-1">
                          {comment.user.name}
                        </p>
                        <p className="text-gray-300">{comment.comment_text}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}