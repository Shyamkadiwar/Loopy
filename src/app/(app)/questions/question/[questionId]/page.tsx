"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Search, Bookmark } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import Answers from "@/components/Answers";
import AddAnswer from "@/components/AddAnswer";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

interface QuestionDetail {
  id: string;
  title: string;
  user: { name: string; email: string; username: string, id: string, image: string };
  description: string;
  images: string[];
  links: string[];
  comments: { comment_text: string; user: { name: string; image: string | null } }[];
  answers: Answer[];
  _count: { comments: number; answers: number };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

interface Answer {
  id: string;
  answer_text: string;
  images: string[];
  links: string[];
  user: { username: string, id: string, name: string; image: string | null };
  upVoteCount: number;
  downVoteCount: number;
  created_at: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    }
  }
}

export default function QuestionDetail({ params }: { params: { questionId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [isProcessingBookmark, setIsProcessingBookmark] = useState<boolean>(false);

  useEffect(() => {
    getQuestionDetail();
    checkUserVote();
    checkBookmarkStatus();
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

  async function checkUserVote() {
    if (!session) return;

    try {
      const response = await axios.get(`/api/vote/check/${params.questionId}`);
      if (response.data.success) {
        setUserVote(response.data.vote_type);
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
          itemId: params.questionId,
          itemType: "question"
        }
      });
      
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }

  async function handleVote(questionId: string, newVoteType: "upvote" | "downvote") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingVote) return;
    setIsProcessingVote(true);

    try {
      if (userVote === newVoteType) {
        // Remove vote if clicking the same type
        const response = await axios.delete(`/api/vote/remove-question-vote/${questionId}`);
        if (response.data.success) {
          setQuestion((prev) => {
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
        const response = await axios.post(`/api/vote/add-question-vote/${questionId}`, {
          vote_type: newVoteType,
          voteable_type: "Question"
        });

        if (response.data.success) {
          setQuestion((prev) => {
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

    if (isProcessingBookmark || !question) return;
    setIsProcessingBookmark(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await axios.delete(`/api/bookmark/remove`, {
          data: {
            itemId: question.id,
            itemType: "question"
          }
        });
        
        if (response.data.success) {
          setIsBookmarked(false);
          toast({
            title: "Bookmark removed",
            description: "Question removed from your bookmarks",
          });
        }
      } else {
        // Add bookmark
        const response = await axios.post(`/api/bookmark/add-bookmark`, {
          itemId: question.id,
          itemType: "question"
        });

        if (response.data.success) {
          setIsBookmarked(true);
          toast({
            title: "Bookmark added",
            description: "Question added to your bookmarks",
          });
        }
      }
    }
    catch (error: unknown) {
      console.error("Error processing bookmark:", error);
    
      if (error instanceof Error) {
        const errorResponse = error as ErrorResponse;
        const errorMessage = errorResponse?.response?.data?.message; 
    
        if (errorMessage === "Already bookmarked") {
          toast({
            title: "Already bookmarked",
            description: "This post is already in your bookmarks",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to process bookmark",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
    
    finally {
      setIsProcessingBookmark(false);
    }
  }

  function handleAnswerAdded(newAnswer: Answer) {
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
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={question.user.image || ''} alt={question.user.name || 'User'} />
                    <AvatarFallback>{question.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Link
                      href={`/user/${question.user.id}`}
                      className="text-white font-space-grotesk"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{question.user.username}
                    </Link>
                    <p className="text-sm text-gray-400 font-space-grotesk">{question.user.name}</p>
                  </div>
                </div>
                <p className="text-white text-xs">
                  {new Date(question.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
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

            {/* Interaction Section */}
            <div className="flex items-center justify-between mt-6 py-4">
              <div className="flex items-center gap-6">
                <Button
                  onClick={() => handleVote(question.id, "upvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className={`h-5 w-5 ${userVote === "upvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{question.upVoteCount}</span>
                </Button>
                <Button
                  onClick={() => handleVote(question.id, "downvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className={`h-5 w-5 ${userVote === "downvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{question.downVoteCount}</span>
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
                <span className="text-gray-400">{question?._count?.answers} answers</span>
              </div>
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