import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileCardProps {
  user: {
    name: string;
    username: string;
    image: string;
    bio: string;
    reputation_points: number;
    created_at: string;
    interest: string[];
    links: Record<string, string>;
    counts: {
      snippets: number;
      comments: number;
      answers: number;
      questions: number;
      posts: number;
      articles: number;
    };
  };
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => {
  if (!user) return null;

  return (
    <div className="user-profile-card">
      {/* User Profile Header */}
      <div className="pb-4 flex">
        <div className="w-1/2 flex gap-6 justify-normal items-center">
          <div>
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.image || ""} alt="Profile" />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-white text-xl">{user.name}</h1>
            <h1 className="text-white text-lg">@{user.username}</h1>
          </div>
        </div>
        <div className="pl-16 pt-3 font-thin">
          <p className="text-white text-xs">
            Joined: {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-white text-xs">
            Reputation Points: <span className="font-bold">{user.reputation_points}</span>
          </p>
          {user.interest && user.interest.length > 0 && (
            <p className="text-white text-xs">Interest: {user.interest.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Bio Section */}
      <div className="">
        {user.bio && (
          <p className="text-gray-400 text-base">{user.bio}</p>
        )}
      </div>

      {/* Links Section */}
      {user.links && Object.keys(user.links).length > 0 && (
        <div className="bg-[#1a191f] p-4 rounded-lg mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">Links</h3>
          <ul className="space-y-2">
            {Object.entries(user.links).map(([key, value], index) => (
              <li key={index}>
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                  {key}: {value}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Stats Section */}
      <div className="pt-8 flex justify-between items-center text-gray-400">
        <p className="text-sm">Posts: {user.counts.posts}</p>
        <p className="text-sm">Questions: {user.counts.questions}</p>
        <p className="text-sm">Answers: {user.counts.answers}</p>
        <p className="text-sm">Snippets: {user.counts.snippets}</p>
        <p className="text-sm">Articles: {user.counts.articles}</p>
        <p className="text-sm">Comments: {user.counts.comments}</p>
      </div>

      <div className="border-b-[1px] border-[#353539] pt-4 pb-4"></div>
    </div>
  );
};

export default UserProfileCard;