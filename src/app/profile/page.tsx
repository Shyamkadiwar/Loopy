"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { data: session, status } = useSession();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" }); // Redirect to homepage after sign out
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not signed in. Please sign in first.</p>;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}</h1>
      <p>Email: {session.user?.email}</p>
      {session.user?.image && <img src={session.user.image} alt="User image" />}
      
      <button onClick={handleSignOut} type="button">
        Sign Out
      </button>
      <Button>hhgg</Button>
    </div>
  );
}
