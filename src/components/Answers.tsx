"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnswerProps {
  answers: {
    id: string;
    answer_text: string;
    images: string[];
    links: string[];
    user: {
      id: string;
      username: string;
      name: string;
      image: string | null;
    };
    upVoteCount: number;
    downVoteCount: number;
    created_at: string;
  }[];
  questionId: string;
}

export default function Answers({ answers, questionId }: AnswerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userVotes, setUserVotes] = useState<Record<string, "upvote" | "downvote" | null>>({});
  const [isProcessingVote, setIsProcessingVote] = useState<boolean>(false);
  const [localAnswers, setLocalAnswers] = useState(answers);

  async function checkUserVote(answerId: string) {
    if (!session) return;

    try {
      const response = await axios.get(`/api/vote/check/${answerId}?voteable_type=answer`);
      if (response.data.success) {
        setUserVotes(prev => ({
          ...prev,
          [answerId]: response.data.vote_type
        }));
      }
    } catch (error) {
      console.error("Error checking user vote:", error);
    }
  }

  async function handleVote(answerId: string, newVoteType: "upvote" | "downvote") {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (isProcessingVote) return;
    setIsProcessingVote(true);

    try {
      const currentVote = userVotes[answerId];

      if (currentVote === newVoteType) {
        // Remove vote if clicking the same type
        const response = await axios.delete(`/api/vote/remove-answer-vote/${answerId}`);
        if (response.data.success) {
          setLocalAnswers(prev =>
            prev.map(answer => {
              if (answer.id === answerId) {
                return {
                  ...answer,
                  upVoteCount: newVoteType === "upvote" ? answer.upVoteCount - 1 : answer.upVoteCount,
                  downVoteCount: newVoteType === "downvote" ? answer.downVoteCount - 1 : answer.downVoteCount,
                };
              }
              return answer;
            })
          );
          setUserVotes(prev => ({
            ...prev,
            [answerId]: null
          }));
        }
      } else {
        // Add or update vote
        const response = await axios.post(`/api/vote/add-answer-vote/${answerId}`, {
          vote_type: newVoteType,
          voteable_type: "Answer"
        });

        if (response.data.success) {
          setLocalAnswers(prev =>
            prev.map(answer => {
              if (answer.id === answerId) {
                let upCount = answer.upVoteCount;
                let downCount = answer.downVoteCount;

                // Remove old vote count if exists
                if (currentVote === "upvote") upCount--;
                if (currentVote === "downvote") downCount--;

                // Add new vote count
                if (newVoteType === "upvote") upCount++;
                if (newVoteType === "downvote") downCount++;

                return {
                  ...answer,
                  upVoteCount: upCount,
                  downVoteCount: downCount,
                };
              }
              return answer;
            })
          );
          setUserVotes(prev => ({
            ...prev,
            [answerId]: newVoteType
          }));
        }
      }
    } catch (error) {
      console.error("Error processing vote:", error);
    } finally {
      setIsProcessingVote(false);
    }
  }

  // Check for user votes when component mounts
  useState(() => {
    if (answers && answers.length > 0) {
      answers.forEach(answer => {
        checkUserVote(answer.id);
      });
    }
  });

  if (!localAnswers || localAnswers.length === 0) {
    return <div className="text-gray-400 py-4">No answers yet. Be the first to answer!</div>;
  }

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-xl font-semibold text-white">{localAnswers.length} Answer{localAnswers.length !== 1 ? 's' : ''}</h2>

      {localAnswers.map((answer) => (
        <Card key={answer.id} className="border-b-[1px] bg-transparent border-[#353539] p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={answer.user.image || ''} alt={answer.user.name || 'User'} />
              <AvatarFallback>{answer.user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <Link
                  href={`/user/${answer.user.id}`}
                  className="text-white font-space-grotesk"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{answer.user.username}
                </Link>
                <h3 className="font-medium text-white">{answer.user.name}</h3>
                <p className="text-sm text-gray-400">{new Date(answer.created_at).toLocaleDateString()}</p>
              </div>

              <div className="space-y-4">
                <p className="text-white whitespace-pre-wrap">{answer.answer_text}</p>

                {/* Display images if available */}
                {answer.images && answer.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {answer.images.map((image, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`Answer image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Display links if available */}
                {answer.links && answer.links.length > 0 && (
                  <div className="bg-[#1a191f] p-4 rounded-lg mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Related Links</h4>
                    <ul className="space-y-2">
                      {answer.links.map((link, index) => (
                        <li key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline break-all text-sm"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mt-4">
                <Button
                  onClick={() => handleVote(answer.id, "upvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsUp className={`h-5 w-5 ${userVotes[answer.id] === "upvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{answer.upVoteCount}</span>
                </Button>
                <Button
                  onClick={() => handleVote(answer.id, "downvote")}
                  disabled={isProcessingVote}
                  className="flex items-center gap-1"
                >
                  <ThumbsDown className={`h-5 w-5 ${userVotes[answer.id] === "downvote" ? "text-white fill-white" : "text-gray-400"}`} />
                  <span>{answer.downVoteCount}</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}