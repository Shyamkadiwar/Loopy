"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Textarea } from "@/components/ui/textarea";
import Comments from "@/components/Comments";
import Answers from "@/components/Answers";
import AddAnswer from "@/components/AddAnswer";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface questionDetail {
  id: string;
  title: string;
  user: { name: string; email: string; username: string, id: string };
  description: string;
  images: string[];
  links: string[];
  comments: { comment_text: string; user: { name: string; image: string | null } }[];
  answers: {
    id: string;
    answer_text: string;
    images: string[];
    links: string[];
    user: { username: string, id: string, name: string; image: string | null };
    upVoteCount: number;
    downVoteCount: number;
    created_at: string;
  }[];
  _count: { comments: number; answers: number };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

export default function questionDetail({ params }: { params: { questionId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState<questionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);

  useEffect(() => {
    getQuestionDetail();
  }, [params.questionId]);

  async function getQuestionDetail() {
    try {
      const response = await axios.get(`/api/questions/get-specific-question/${params.questionId}`);
      if (response.data.success) {
        setQuestion(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
      setError("Failed to load question details. Please try again later.");
    }
  }

  async function addComment(type: "question") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (!commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const response = await axios.post(`/api/comments/add-comment/${question?.id}`, {
        comment_text: commentText,
        commentable_type: type
      });

      if (response.data.success) {
        const newComment = {
          id: response.data.data.id,
          comment_text: response.data.data.comment_text,
          user: {
            name: session.user?.name || "Anonymous",
            image: session.user?.image || null
          },
          created_at: new Date().toISOString()
        };

        setQuestion((prev) => {
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

        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again later.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  function handleAnswerAdded(newAnswer: any) {
    setQuestion((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        answers: [...(prev.answers || []), newAnswer],
        _count: {
          ...prev._count,
          answers: (prev._count.answers || 0) + 1
        }
      };
    });
  }

  if (status === "loading" || !question) {
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
              Back to questions
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>
        <div className="max-w-4xl mx-auto py-6 px-4">

          <Card className="p-6 border-0 font-space-grotesk bg-[#0a090f]">
            <div className="pb-4">
              <div className="flex gap-3 mb-6">
                <Link
                  href={`/user/${question.user.id}`}
                  className="text-white text-sm font-space-grotesk"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{question.user.username}
                </Link>
                <p className="text-sm text-gray-400">{question.user.name}</p>
              </div>
              <p className="text-sm text-gray-400">{new Date(question.created_at).toLocaleDateString()}</p>
            </div>

            <div className="space-y-6">
              <h1 className="text-white text-2xl">{question.title}</h1>
              <p className="text-white">{question.description}</p>
              {question.images && question.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.images.map((image, index) => (
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

              {question.links && question.links.length > 0 && (
                <div className="bg-[#1a191f] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Related Links</h3>
                  <ul className="space-y-2">
                    {question.links.map((link, index) => (
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



            {/* Divider */}
            <div className="border-t border-[#353539] my-10"></div>

            {/* Add Answer Section */}
            <AddAnswer
              questionId={question.id}
              onAnswerAdded={handleAnswerAdded}
            />
            {/* Answers Section */}
            <Answers
              answers={question.answers || []}
              questionId={question.id}
            />

          </Card>
        </div>
      </div>
    </div>
  );
}