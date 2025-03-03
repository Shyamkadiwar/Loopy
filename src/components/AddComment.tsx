import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AddCommentProps {
  contentId: string;
  commentableType: "Snippet" | "Post" | "Article" | "Answer" | "Question";
  commentOn: "snippet" | "post" | "article" | "answer" | "question";
  onCommentAdded: (newComment: any) => void;
}

const AddComment: React.FC<AddCommentProps> = ({ contentId, commentOn, commentableType, onCommentAdded }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  async function addComment() {
    if (!session) {
      router.push("/signin");
      return;
    }

    if (!commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const response = await axios.post(`/api/comments/add-${commentOn}-comment/${contentId}`, {
        comment_text: commentText,
        commentable_type: commentableType,
      });

      if (response.data.success) {
        const newComment = {
          id: response.data.data.id,
          comment_text: response.data.data.comment_text,
          user: {
            id: session.user?.id || '',
            name: session.user?.name || "Anonymous",
            username: session.user?.username || "user",
          },
        };

        onCommentAdded(newComment);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  return (
    <div className="pt-4">
      <h3 className="text-xl font-semibold text-white mb-4">Add Comment</h3>
      <Textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Add a comment..."
        className="bg-[#121218] border-[#353539] text-white resize-none"
        rows={3}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={addComment} disabled={!commentText.trim() || isSubmittingComment} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Post Comment
        </Button>
      </div>
    </div>
  );
};

export default AddComment;
