"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Link, Image, X, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AddAnswerProps {
  questionId: string;
  onAnswerAdded: (newAnswer: any) => void;
}

export default function AddAnswer({ questionId, onAnswerAdded }: AddAnswerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [answerText, setAnswerText] = useState<string>("");
  const [links, setLinks] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!session) {
    return null;
  }

  const addLink = () => {
    if (currentLink.trim() && isValidUrl(currentLink)) {
      setLinks([...links, currentLink.trim()]);
      setCurrentLink("");
      if (linkInputRef.current) {
        linkInputRef.current.focus();
      }
    } else if (currentLink.trim()) {
      setError("Please enter a valid URL");
      setTimeout(() => setError(null), 3000);
    }
  };

  const addImage = () => {
    if (currentImage.trim() && isValidUrl(currentImage)) {
      setImages([...images, currentImage.trim()]);
      setCurrentImage("");
      if (imageInputRef.current) {
        imageInputRef.current.focus();
      }
    } else if (currentImage.trim()) {
      setError("Please enter a valid image URL");
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      setError("Answer text cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(`/api/answers/add-answer/${questionId}`, {
        answer_text: answerText,
        links,
        images
      });

      if (response.data.success) {
        const newAnswer = {
          ...response.data.data,
          user: {
            name: session.user?.name || "Anonymous",
            image: session.user?.image || null
          },
          upVoteCount: 0,
          downVoteCount: 0
        };
        
        onAnswerAdded(newAnswer);
        setAnswerText("");
        setLinks([]);
        setImages([]);
      } else {
        setError(response.data.message || "Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit answer. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'link' | 'image') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'link') {
        addLink();
      } else {
        addImage();
      }
    }
  };

  return (
    <div className="mt-8 mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">Add Answer</h3>
      <div className="space-y-4">
        <Textarea
          placeholder="Write your answer here..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          className="bg-[#1a191f] border-[#353539] text-white"
          rows={5}
        />

        {/* Links Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-gray-400" />
            <h4 className="text-sm font-medium text-white">Add Links</h4>
          </div>
          
          <div className="flex gap-2">
            <Input
              ref={linkInputRef}
              placeholder="https://example.com"
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'link')}
              className="bg-[#1a191f] border-[#353539] text-white"
            />
            <Button onClick={addLink} variant="outline" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {links.length > 0 && (
            <div className="bg-[#1a191f] p-3 rounded-lg">
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm truncate max-w-xs"
                    >
                      {link}
                    </a>
                    <Button
                      onClick={() => removeLink(index)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-gray-400" />
            <h4 className="text-sm font-medium text-white">Add Image URLs</h4>
          </div>
          
          <div className="flex gap-2">
            <Input
              ref={imageInputRef}
              placeholder="https://example.com/image.jpg"
              value={currentImage}
              onChange={(e) => setCurrentImage(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'image')}
              className="bg-[#1a191f] border-[#353539] text-white"
            />
            <Button onClick={addImage} variant="outline" className="flex-shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="h-20 object-cover w-full rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150?text=Invalid+Image";
                    }}
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 bg-black/50 text-white p-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !answerText.trim()}
          className="flex items-center gap-2 self-end w-full sm:w-auto"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Post Answer"}
        </Button>
      </div>
    </div>
  );
}