"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MessageSquare, Code } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProfileDropdown from "@/components/ProfileDropdown";

interface Tag {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  comment_text: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
  user: {
    name: string;
    username: string;
  };
  tags: Tag[];
  comments: Comment[];
}

export default function Snippets() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getSnippets();
  }, []);

  async function getSnippets() {
    try {
      const response = await axios.get("/api/snippet/get-all-snippets");
      setSnippets(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching snippets:", error);
      setError("Failed to load snippets. Please try again later.");
    }
  }

  const handleSnippetClick = (snippetId: string) => {
    router.push(`/snippets/snippet/${snippetId}`);
  };

  const filteredSnippets = snippets.filter((snippet) => 
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (status === "loading") {
    return (
      <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] selection:bg-white selection:text-black">
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
          <Button onClick={() => router.push('/add/add-snippet')} className="text-white">
            Create Snippet
          </Button>
          <ProfileDropdown user={session?.user} />
          </div>
        </div>

        {/* Snippets List */}
        <div className="w-1/2 mx-auto py-6 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet) => (
              <Card
                key={snippet.id}
                className="p-4 border-0 bg-[#0a090f] rounded-none border-b-[1px] border-[#353539] hover:border-[#4b4b52] cursor-pointer transition-colors"
                onClick={() => handleSnippetClick(snippet.id)}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground text-white font-space-grotesk">@{snippet.user.username}</p>
                    <p className="text-sm text-gray-400 font-space-grotesk">{snippet.user.name}</p>
                    <p className="text-sm text-gray-400 font-space-grotesk ml-auto">
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-semibold font-space-grotesk text-white mb-2 pl-4">
                      {snippet.title}
                    </h1>
                    <p className="text-muted-foreground line-clamp-2 font-space-grotesk pl-4">
                      {snippet.description}
                    </p>
                  </div>

                  <div className="bg-[#121218] rounded-lg p-3 overflow-hidden">
                    <div className="flex items-center mb-2">
                      <Code className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-400 font-mono text-sm uppercase">{snippet.language}</span>
                    </div>
                    <pre className="text-white font-mono text-sm overflow-x-auto p-2 line-clamp-3">
                      {snippet.code}
                    </pre>
                  </div>

                  {snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-4">
                      {snippet.tags.map((tag) => (
                        <span 
                          key={tag.id} 
                          className="bg-white text-black text-base font-semibold px-3 py-1 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pl-4">
                    <div className="flex items-center gap-6 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-space-grotesk">{snippet.comments.length}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{snippet.upVoteCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{snippet.downVoteCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              No snippets available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}