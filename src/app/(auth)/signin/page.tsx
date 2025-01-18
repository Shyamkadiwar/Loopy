"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/profile" });
  };

  return (
    <div>
       <button onClick={() => handleSignIn("google")} type="button">
         Sign in with Google
       </button>
      <button onClick={() => handleSignIn("github")} type="button">
        Sign in with GitHub
      </button>
    </div>
  );
}
