"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProfileDropdown from "@/components/ProfileDropdown";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface article {
  id: string;
  title: string;
  user: {
    id: string;
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
  created_at: Date;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setarticles] = useState<article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getarticle();
  }, []);

  async function getarticle() {
    try {
      const response = await axios.get("/api/articles/get-all-article");
      setarticles(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to load articles. Please try again later.");
    }
  }

  const handlearticleClick = (articleId: string) => {
    router.push(`/articles/article/${articleId}`);
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
      <div className="flex-1 overflow-y-auto relative">
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
          <div className="flex justify-center items-center gap-10">
            <Button onClick={() => router.push('/add/add-article')} className="text-white">
              Create Article
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>

        {/* articles List */}
        <div className="w-1/2 mx-auto py-6 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          {articles.length > 0 ? (
            articles.map((article) => (
              <Card
                key={article.id}
                className="p-4 border-0 bg-[#0a090f] rounded-none border-b-[1px] border-[#353539] hover:border-[#4b4b52] cursor-pointer transition-colors"
                onClick={() => handlearticleClick(article.id)}
              >
                <div className="flex flex-col gap-4">
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
                  <div>
                    <h1 className="text-xl font-semibold font-space-grotesk text-white mb-2 pl-4">
                      {article.title}
                    </h1>
                    <p className="text-muted-foreground line-clamp-2 font-space-grotesk pl-4">
                      {article.description}
                    </p>
                  </div>

                  {article.images && article.images.length > 0 && (
                    <div className="relative h-64 w-full overflow-hidden rounded-lg pl-4">
                      <img
                        src={article.images[0]}
                        alt="article preview"
                        className="object-cover w-full h-full"
                      />
                      {article.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                          +{article.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pl-4">


                    <div className="flex items-center gap-6 pb-10">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-space-grotesk">{article._count.comments}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{article.upVoteCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{article.downVoteCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              No articles available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}