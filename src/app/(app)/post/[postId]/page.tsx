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
    id: string;
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
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  useEffect(() => {
    getPostDetail();
    checkUserVote();
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

  async function addVote(postId: string, vote_type: "upvote" | "downvote", voteable_type: string) {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (userVote === vote_type) return; // Prevent double voting

    try {
      const response = await axios.post(`/api/vote/add-post-vote/${postId}`, { vote_type, voteable_type });

      if (response.data.success) {
        setUserVote(vote_type);

        setPost((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            upVoteCount: vote_type === "upvote" ? prev.upVoteCount + 1 : prev.upVoteCount,
            downVoteCount: vote_type === "downvote" ? prev.downVoteCount + 1 : prev.downVoteCount,
          };
        });
      }
    } catch (error) {
      console.error("Error while adding vote to post:", error);
      setError("Failed to cast vote. Please try again later.");
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
      const response = await axios.post(`/api/comments/add-post-comment/${post?.id}`, {comment_text: commentText, commentable_type});

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
        setPost((prev) => {
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
                <Button onClick={() => addVote(post.id, "upvote", "Post")} className="flex items-center gap-1">
                  <ThumbsUp className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{post.upVoteCount}</span>
                </Button>
                <Button onClick={() => addVote(post.id, "downvote", "Post")} className="flex items-center gap-1">
                  <ThumbsDown className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{post.downVoteCount}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{post._count.comments} comments</span>
              </div>
            </div>

            {/* Add Comment Section */}
            <div className="mt-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Add Comment</h3>
              <div className="flex flex-col space-y-3">
                <Textarea
                  placeholder="Write your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="bg-[#1a191f] border-[#353539] text-white text-lg"
                  rows={3}
                />
                <Button 
                  onClick={() => addComment("Post")} 
                  disabled={isSubmittingComment || !commentText.trim()} 
                  className="flex items-center gap-2 self-end"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
              <div className="space-y-4">
                {post.comments.map((comment, index) => (
                  <Card key={index} className="p-4 border-0 border-l-2 rounded-none border-[#353539] bg-[#0a090f]">
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
                {post.comments.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}