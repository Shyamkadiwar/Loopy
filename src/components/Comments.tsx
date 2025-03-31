import Link from 'next/link';
import React from 'react';

interface Comment {
  id?: string;
  comment_text: string;
  user: {
    name: string;
    id: string;
    username: string;
    image?: string | null;
  };
}

interface CommentsProps {
  comments: Comment[];
}

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={comment.id || `comment-${index}`} className="py-6 border-b border-[#353539]">
            <div className="flex gap-3">
              {comment.user.image ? (
                <img
                  src={comment.user.image}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#353539] flex items-center justify-center">
                  <span className="text-white text-sm">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/user/${comment.user.id}`}
                    className="text-white font-space-grotesk"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{comment.user.username}
                  </Link>
                  <p className="font-bold text-white">
                    {comment.user.name}
                  </p>
                </div>
                <p className="text-white mt-1">{comment.comment_text}</p>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default Comments;