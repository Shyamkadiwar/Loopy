"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

interface PostDetail {
  id: string;
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

export default function PostDetail({ params }: { params: { postId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPostDetail();
  }, [params.postId]);

  async function getPostDetail() {
    try {
      const response = await axios.get(`/api/posts/get-specific-post/${params.postId}`);
      if (response.data.success) {
        setPost(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setError("Failed to load post details. Please try again later.");
    }
  }

  if (status === "loading" || !post) {
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
            Back to Posts
          </Button>

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            {/* Post Header */}
            <div className="pb-4">
                <div className="flex gap-3 mb-6">
                <p className="text-sm text-gray-400">@{post.user.username}</p>
                <p className="text-sm text-gray-400">{post.user.name}</p>
                </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-6 ml-4">
              <p className="text-white whitespace-pre-wrap">{post.description}</p>

              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.images.map((image, index) => (
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

              {post.links && post.links.length > 0 && (
                <div className="bg-[#1a191f] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Related Links</h3>
                  <ul className="space-y-2">
                    {post.links.map((link, index) => (
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
            <div className="flex items-center ml-4 justify-between mt-6 py-4 ">
              <div className="flex items-center gap-6">
                <Button className="flex items-center gap-1">
                  <ThumbsUp className="h-5 w-5" />
                  <span>{post.upVoteCount}</span>
                </Button>
                <Button className="flex items-center gap-1">
                  <ThumbsDown className="h-5 w-5" />
                  <span>{post.downVoteCount}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{post._count.comments} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
              <div className="space-y-4">
                {post.comments.map((comment, index) => (
                  <Card key={index} className="p-4 border-b-[1px] border-[#353539] bg-[#0a090f]">
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