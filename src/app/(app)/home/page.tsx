"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  user: {
    name: string;
    email: string;
    username: string;
    image: string;
  };
  description: string;
  upVoteCount: number;
  downVoteCount: number;
  images: string[];
  _count: {
    comments: number;
  };
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost();
  }, []);

  async function getPost() {
    try {
      const response = await axios.get("/api/posts/get-all-post");
      setPosts(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
    }
  }

  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
        <p className="text-white text-xl">
          You are not signed in. Please sign in first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto relative border-b-[2px] border-[#353539]">
        {/* Header */}
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
          <Button onClick={() => router.push('/add/add-post')} className="text-white">
            Create Post
          </Button>
        </div>

        {/* Posts List */}
        <div className="w-1/2 mx-auto py-6 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          {posts.length > 0 ? (
            posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 border-0 bg-[#0a090f] rounded-none border-b-[1px] border-[#353539] hover:border-[#4b4b52] cursor-pointer transition-colors"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {/* <img src={post.user.image} alt="User avatar" /> */}
                    <p className="text-white font-space-grotesk">@{post.user.username}</p>
                    <p className="text-sm text-gray-400 font-space-grotesk">{post.user.name}</p>
                  </div>
                  <div className="ml-4">
                    {/* <h1 className="text-xl font-semibold font-space-grotesk text-white mb-2">
                      {post.title}
                    </h1> */}
                    <p className="text-base text-gray-400 line-clamp-2 font-space-grotesk">
                      {post.description}
                    </p>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="ml-4 relative h-64 w-full overflow-hidden rounded-lg">
                      <img
                        src={post.images[0]}
                        alt="Post preview"
                        className="object-cover w-full h-full"
                      />
                      {post.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                          +{post.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ml-4 flex items-center justify-between mt-2 pb-10">


                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-space-grotesk">{post._count.comments}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{post.upVoteCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{post.downVoteCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="h-screen justify-center items-center text-center">
              No posts available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}