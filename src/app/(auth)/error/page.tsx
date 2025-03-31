'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Create a client component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Already Exists',
          message: 'An account with this email already exists using a different sign-in method. Please sign in using your original method, or contact support for help linking your accounts.',
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication. Please try again.',
        };
    }
  };

  const errorInfo = getErrorMessage(error || '');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a090f]">
      <div className="mx-auto max-w-md space-y-6 p-6 bg-white/5 rounded-lg border border-white/10">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            {errorInfo.title}
          </h1>
          <p className="text-gray-400">
            {errorInfo.message}
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Return to Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a090f]">
        <div className="mx-auto max-w-md space-y-6 p-6 bg-white/5 rounded-lg border border-white/10">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}