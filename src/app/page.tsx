"use client";

import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">FlashyCardy</h1>
        <p className="text-lg text-muted-foreground">
          Your personal flashcard platform
        </p>
        <div className="mt-4 flex items-center gap-3">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button>Sign up</Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
