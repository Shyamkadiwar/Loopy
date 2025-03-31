"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send, Search, Bookmark } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import Comments from "@/components/Comments"
import AddComment from "@/components/AddComment";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";


interface PostDetail {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    image: string;
  };
  description: string;
  images: string[];
  links: string[];
  comments: {
    id: string;
    comment_text: string;
    user: {
      id: string;
      username: string;
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
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState<boolean>(false);

  useEffect(() => {
    getPostDetail();
    checkUserVote();
    checkBookmarkStatus();
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

  async function checkUserVote() {
    if (!session) return;

    try {
      const response = await axios.get(`/api/vote/check/${params.postId}`);
      if (response.data.success) {
        setUserVote(response.data.vote_type); // "upvote" or "downvote"
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  }

  async function checkBookmarkStatus() {
    if (!session) return;

    try {
      const response = await axios.get(`/api/bookmark/check`, {
        params: {
          itemId: params.postId,
          itemType: "post"
        }
      });
      
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }

  async function handleVote(postId: string, newVoteType: "upvote" | "downvote") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingVote) return;
    setIsProcessingVote(true);

    try {
      if (userVote === newVoteType) {
        // Remove vote if clicking the same type
        const response = await axios.delete(`/api/vote/remove-post-vote/${postId}`);
        if (response.data.success) {
          setPost((prev) => {
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
        const response = await axios.post(`/api/vote/add-post-vote/${postId}`, {
          vote_type: newVoteType,
          voteable_type: "Post"
        });

        if (response.data.success) {
          setPost((prev) => {
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

  async function handleBookmark() {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingBookmark || !post) return;
    setIsProcessingBookmark(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await axios.delete(`/api/bookmark/remove`, {
          data: {
            itemId: post.id,
            itemType: "post"
          }
        });
        
        if (response.data.success) {
          setIsBookmarked(false);
          toast({
            title: "Bookmark removed",
            description: "Post removed from your bookmarks",
          });
        }
      } else {
        const response = await axios.post(`/api/bookmark/add-bookmark`, {
          itemId: post.id,
          itemType: "post"
        });

        if (response.data.success) {
          setIsBookmarked(true);
          toast({
            title: "Bookmark added",
            description: "Post added to your bookmarks",
          });
        }
      }
    } catch (error: any) {
      console.error("Error processing bookmark:", error);
      
      if (error.response?.data?.message === "Already bookmarked") {
        toast({
          title: "Already bookmarked",
          description: "This post is already in your bookmarks",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to process bookmark",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessingBookmark(false);
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
              Back to Post
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>
        <div className="max-w-4xl mx-auto py-6 px-4">

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            {/* Post Header */}
            <div className="pb-4">
            <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.user.image || ''} alt={post.user.name || 'User'} />
                        <AvatarFallback>{post.user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link
                          href={`/user/${post.user.id}`}
                          className="text-white font-space-grotesk"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{post.user.username}
                        </Link>
                        <p className="text-sm text-gray-400 font-space-grotesk">{post.user.name}</p>
                      </div>
                    </div>
                    <p className="text-white text-xs">
                      {new Date(post.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                <Button
                  onClick={() => handleVote(post.id, "upvote")}
                  disabled={isProcessingVote}
                  className={`flex items-center gap-1"
                      }`}
                >
                  <ThumbsUp className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"
                    }`} />
                  <span>{post.upVoteCount}</span>
                </Button>
                <Button
                  onClick={() => handleVote(post.id, "downvote")}
                  disabled={isProcessingVote}
                  className={`flex items-center gap-1"
                      }`}
                >
                  <ThumbsDown className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"
                    }`} />
                  <span>{post.downVoteCount}</span>
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
                <span className="text-gray-400">{post._count.comments} comments</span>
              </div>
            </div>

            <AddComment
              contentId={post.id}
              commentOn="post"
              commentableType="Post"
              onCommentAdded={(newComment) => setPost((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev)}
            />
            <Comments comments={post.comments} />
          </Card>
        </div>
      </div>
    </div>
  );
}