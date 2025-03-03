"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Code, Send, MessageSquare } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import Comments from "@/components/Comments";
import AddComment from "@/components/AddComment";

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
  user: { name: string; username: string };
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
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Button onClick={() => router.back()} variant="ghost" className="text-white text-sm mb-6 flex items-center gap-2 border-[#353539] border-[1px]">
            <ArrowLeft className="h-5 w-5" />
            Back to snippets
          </Button>

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            <div className="pb-4">
              <p className="text-sm text-gray-400">@{snippet.user.username}</p>
              <p className="text-sm text-gray-400">{new Date(snippet.created_at).toLocaleDateString()}</p>
            </div>

            <h1 className="text-white text-2xl">{snippet.title}</h1>
            <p className="text-white">{snippet.description}</p>

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
