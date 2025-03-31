"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { Session } from "next-auth";

interface ProfileDropdownProps {
  user: Session["user"];
}

const ProfileDropdown = ({ user }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="rounded-full p-1 border-2 border-gray-500">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.image || ""} alt="Profile" />
          <AvatarFallback>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0a090f] border border-[#353539] shadow-lg rounded-lg overflow-hidden">
          <button
            onClick={() => router.push(`/user/${user?.id}`)}
            className="flex items-center gap-2 px-4 py-4 text-white hover:bg-white hover:text-black w-full text-left"
          >
            <User size={16} />
            View Profile
          </button>
          <button
            onClick={() => router.push(`/user/${user?.id}`)}
            className="flex items-center gap-2 px-4 py-4 text-white hover:bg-white hover:text-black w-full text-left"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-4 text-white hover:bg-white hover:text-black w-full text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
