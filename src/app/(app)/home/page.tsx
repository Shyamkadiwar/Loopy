"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  name: string;
  email: string;
  description: string;
  upVoteCount: number
  downVoteCount: number
  image: string[]
}

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost();
  }, []);

  async function getPost() {
    try {
      const response = await axios.get("/api/posts/get-all-post")

      setPosts(response.data.data || []);
      console.log(posts);
      setError(null); // Clear previous errors if successful
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again later.");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          You are not signed in. Please sign in first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
      <AppSidebar />
      <div className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="flex p-4 justify-between items-center border-b-[1px] border-[#353539] sticky top-0 bg-[#0a090f]">
          {/* Search Bar */}
          <div className="relative w-1/3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 text-lg border-[1px] border-[#353539] text-white"
              aria-label="Search posts"
            />
          </div>

          {/* Sign Out Button */}
          <Button onClick={() => signOut()} className="text-white">
            Sign Out
          </Button>
        </div>

        {/* Posts List */}
        <div className="w-11/12 mx-auto py-6 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          {posts.length > 0 ? (
            posts.map((post) => (
              <Card
                key={post.id}
                className="p-4 border-[1px] border-[#353539] bg-[#0a090f]"
              >
                <h1 className="text-lg font-semibold text-white">
                  {post.title}
                </h1>
                <p className="text-muted-foreground">{post.description}</p>
                {post.image && post.image.length > 0 ? (
                  <img src={post.image[0]} alt="Post image" className="w-full h-auto rounded-md" />
                ) : (
                  <p className="text-gray-400">No image available</p>
                )}

                <p className="text-muted-foreground">{post.name}</p>
                <p className="text-white text-sm">{post.email}</p>
                <p className="text-lg font-semibold text-white">{post.upVoteCount}</p>
                <p className="text-lg font-semibold text-white">{post.downVoteCount}</p>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              No posts available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
