import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface UserProfileCardProps {
  user: {
    name: string;
    username: string;
    image: string;
    bio: string;
    reputation_points: number;
    created_at: string;
    interest: string[] | undefined;
    links: Record<string, string> | undefined;
    counts: {
      snippets: number;
      comments: number;
      answers: number;
      questions: number;
      posts: number;
      articles: number;
    };
  };
  onUserUpdate?: (updatedUser: Partial<UserProfileCardProps["user"]>) => void;
  isProfileOwner?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ 
  user, 
  onUserUpdate, 
  isProfileOwner = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    interests: user?.interest?.join(", ") || "",
    links: user?.links
      ? Object.entries(user.links)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
      : "",
  });

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const parseLinks = (linksText: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!linksText.trim()) return result;

    linksText.split("\n").forEach(line => {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    });

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const interestArray = formData.interests
        ? formData.interests.split(",").map(item => item.trim()).filter(Boolean)
        : [];

      const linksObject = parseLinks(formData.links);

      const response = await fetch("/api/profile/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          interest: interestArray,
          links: linksObject
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);

        // Update the local user data to reflect changes
        if (onUserUpdate && data.data) {
          onUserUpdate(data.data);
        } else {
          // Refresh the page to show updated data if no update handler provided
          window.location.reload();
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="user-profile-card">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Edit Form */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.image || ""} alt="Profile" />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <label className="block text-white text-sm mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-[#1a191f] text-white border border-[#353539]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bg-[#1a191f] text-white min-h-24 border border-[#353539]"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-1">
              Interests (comma separated)
            </label>
            <Input
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              className="bg-[#1a191f] text-white border border-[#353539]"
              placeholder="React, TypeScript, Next.js"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-1">
              Links (one per line, format: "label: url")
            </label>
            <Textarea
              name="links"
              value={formData.links}
              onChange={handleChange}
              className="bg-[#1a191f] text-white border border-[#353539]"
              placeholder="Link"
            />
            <p className="text-xs text-gray-400 mt-1">
              Format example: "GitHub: https://github.com/username"
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="outline">Save Changes</Button>
          </div>
        </form>
      ) : (
        <>
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
                Joined:{" "}
                {new Date(user.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-white text-xs">
                Reputation Points:{" "}
                <span className="font-bold">{user.reputation_points}</span>
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="">
            <p className="text-gray-400 text-base">
              {user.bio || "No bio available"}
            </p>
          </div>

          {/* Interest Section */}
          <div className="rounded-lg mt-4">
            <p className="text-white mb-2">
              Interest:{" "}
            </p>

            <div className="flex gap-2">
            {user.interest && user.interest.length > 0
              ? user.interest.map((interest, index) => (
                <p key={index} className="flex items-center w-min justify-between p-2 text-xs font-bold bg-white rounded-full">
                  {interest}
                </p>
              ))
              : <p className="text-gray-400 text-sm">N/A</p>
            }
            </div>
          </div>

          {/* Links Section */}
          <div className="rounded-lg mt-4">
            <h3 className="font-semibold text-white mb-2">Links:</h3>
            {user.links && Object.keys(user.links).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(user.links).map(([key, value], index) => (
                  <li key={index}>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {key}: {value}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">N/A</p>
            )}
          </div>

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

          {/* Conditionally render Edit Button */}
          {isProfileOwner && (
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserProfileCard;