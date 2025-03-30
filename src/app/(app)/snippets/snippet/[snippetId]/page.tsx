"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Code, Send, MessageSquare, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import Comments from "@/components/Comments";
import AddComment from "@/components/AddComment";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Comment {
  id: string;
  comment_text: string;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

interface Tag {
  id: string;
  name: string;
}

interface SnippetDetail {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  user: { id: string; name: string; username: string, image: string };
  tags: Tag[];
  comments: Comment[];
  created_at: string;
}

export default function SnippetDetail({ params }: { params: { snippetId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [snippet, setSnippet] = useState<SnippetDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  useEffect(() => {
    getSnippetDetail();
  }, [params.snippetId]);

  async function getSnippetDetail() {
    try {
      const response = await axios.get(`/api/snippet/get-specific-snippet/${params.snippetId}`);
      if (response.data.success) {
        setSnippet(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching snippet details:", error);
      setError("Failed to load snippet details. Please try again later.");
    }
  }

  async function addComment() {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (!commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const response = await axios.post(`/api/comments/add-snippet-comment/${snippet?.id}`, {
        comment_text: commentText,
        commentable_type: "Snippet"
      });

      if (response.data.success) {
        const newComment = {
          id: response.data.data.id,
          comment_text: response.data.data.comment_text,
          user: {
            id: session.user?.id || '',
            name: session.user?.name || "Anonymous",
            username: session.user?.username || "user"
          }
        };

        setSnippet((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again later.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  if (status === "loading" || !snippet) {
    return <div className="flex h-screen justify-center items-center w-screen bg-[#0a090f] text-white text-xl">Loading...</div>;
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a090f]">
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
              Back to snippets
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>
        <div className="max-w-4xl mx-auto py-6 px-4">

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={snippet.user.image || ''} alt={snippet.user.name || 'User'} />
                  <AvatarFallback>{snippet.user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Link
                    href={`/user/${snippet.user.id}`}
                    className="text-white font-space-grotesk"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{snippet.user.username}
                  </Link>
                  <p className="text-sm text-gray-400 font-space-grotesk">{snippet.user.name}</p>
                </div>
              </div>
              <p className="text-white text-xs">
                {new Date(snippet.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <h1 className="text-white text-2xl pt-10">{snippet.title}</h1>
            <p className="text-white pt-2 pb-10">{snippet.description}</p>

            {/* Code Editor */}
            <div className="h-96 border border-[#353539] rounded-lg mt-4">
              <MonacoEditor
                height="100%"
                value={snippet.code}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 16, wordWrap: "on" }}
              />
            </div>
            <div className="flex items-center ml-4 justify-between mt-6 py-4 ">

              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">{snippet.comments.length} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-[#353539] my-10"></div>
            <AddComment
              contentId={snippet.id}
              commentOn="snippet"
              commentableType="Snippet"
              onCommentAdded={(newComment) => setSnippet((prev) => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev)}
            />
            <Comments comments={snippet.comments} />
          </Card>
        </div>
      </div>
    </div>
  );
}
