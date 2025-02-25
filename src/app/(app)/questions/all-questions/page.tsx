"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, MessageSquare, MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

interface question {
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
  answers: number[];
  images: string[];
  _count: {
    comments: number;
  };
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [questions, setquestions] = useState<question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getquestion();
  }, []);

  async function getquestion() {
    try {
      const response = await axios.get("/api/questions/get-all-questions");
      setquestions(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again later.");
    }
  }

  const handlequestionClick = (questionId: string) => {
    router.push(`/questions/question/${questionId}`);
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
              aria-label="Search questions"
            />
          </div>
          <Button onClick={() => router.push('/add/add-question')} className="text-white">
            Ask question
          </Button>
        </div>

        {/* questions List */}
        <div className="w-1/2 mx-auto py-6 space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}

          {questions.length > 0 ? (
            questions.map((question) => (
              <Card
                key={question.id}
                className="p-4 border-0 bg-[#0a090f] rounded-none border-b-[1px] border-[#353539] hover:border-[#4b4b52] cursor-pointer transition-colors"
                onClick={() => handlequestionClick(question.id)}
              >
                <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                      {/* <img src={question.user.image} alt="User avatar" /> */}
                      <p className="text-muted-foreground text-white font-space-grotesk">@{question.user.username}</p>
                      <p className="text-sm text-gray-400 font-space-grotesk">{question.user.name}</p>
                    </div>
                  <div>
                    <h1 className="text-xl font-semibold font-space-grotesk text-white mb-2 pl-4">
                      {question.title}
                    </h1>
                    <p className="text-muted-foreground line-clamp-2 font-space-grotesk pl-4">
                      {question.description}
                    </p>
                  </div>

                  {question.images && question.images.length > 0 && (
                    <div className="relative h-64 w-full overflow-hidden rounded-lg pl-4">
                      <img 
                        src={question.images[0]} 
                        alt="question preview" 
                        className="object-cover w-full h-full"
                      />
                      {question.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                          +{question.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pl-4">
                    

                    <div className="flex items-center gap-6 pb-10">
                      <div className="flex items-center gap-2">
                        <MessageCircleQuestion className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-space-grotesk">{question.answers.length}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{question.upVoteCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 font-space-grotesk">{question.downVoteCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center">
              No questions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}