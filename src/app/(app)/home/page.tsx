"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function Profile() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">You are not signed in. Please sign in first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-[#0a090f]">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {session.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name ?? "User"} />
              ) : (
                <AvatarFallback>
                  {session.user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {session.user?.name ?? "Welcome"}
              </h1>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Add additional profile information here */}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}