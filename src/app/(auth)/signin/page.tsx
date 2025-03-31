'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github } from 'lucide-react';
import { SiGoogle } from "react-icons/si";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const signInSchema = z.object({
  login: z.string().min(1, "Email or username is required"),
  password: z.string().min(7, "Password should be minimum 7 characters")
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      login: "",
      password: "",
    }
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const result = await signIn('credentials', {
        login: data.login,
        password: data.password,
        redirect: false,
        callbackUrl: '/home'
      });

      if (result?.error) {
        setError(result.error);
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials',
        });
      }
      else {
        router.push('/home');
        router.refresh();
      }
    }
    catch (_) {
      setError('An error occurred during sign in');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = (provider: 'github' | 'google') => {
    signIn(provider, {
      callbackUrl: '/home'
    });
  };

  return (
    <div className="bg-[#0a090f] text-white selection:bg-white selection:text-black">
      <div className="relative bg-[#0a090f] w-screen h-screen">
        {/* Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
          <div className="absolute top-0 left-3/4 w-[1px] h-full bg-[#353539] opacity-50 z-0"></div>
          <div className="absolute top-3/4 left-0 w-full h-[1px] bg-[#353539] opacity-50 z-0"></div>
        </div>

        <div className="flex pt-28 justify-center h-full">
          {/* Left Section */}
          <div className="w-2/5 h-1/2 relative z-20">
            <div className="w-full border-b-[1px] border-[#4a4a50] flex hover:border-[#71717a]">
            <Link href="/" > <h1 className="text-9xl font-extrabold m-4 font-space-grotesk pl-4">LOOPY</h1></Link>
            </div>

            <div className="w-full pt-20">
              <div className="w-3/4 border-[1px] hover:border-[#4b4b52] p-3 mb-4 border-[#353539]">
                <span><FontAwesomeIcon icon={faQuoteLeft} className="pl-4" /></span>
                <p className="text-base text-gray-300 font-normal m-4 mb-10 text-start hover:font-bold">
                  <span className="text-black text-lg font-extrabold bg-white">Loopy</span> is the ultimate platform for developers to store, share, and collaborate on code effortlessly. It simplifies knowledge-sharing through articles, discussions, and Q&A while fostering a vibrant community for open-source contributions and real-time collaboration.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section signin form */}
          <div className="w-2/6 border-[#353539] flex flex-col relative overflow-hidden">
            <div className="w-full border-[1px] hover:border-[#4b4b52] p-6 border-[#353539] flex flex-col items-center">
              <h2 className="text-lg text-center mb-10">Welcome back</h2>

              <div className='pb-4 w-full flex justify-center'>
                <Button
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-2/4 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition flex items-center gap-2"
                >
                  <SiGoogle /> Sign in with Google
                </Button>
              </div>

              <div className="pb-4 w-full flex justify-center">
                <Button
                  onClick={() => handleOAuthSignIn('github')}
                  className="w-2/4 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition flex items-center gap-2"
                >
                  <Github /> Sign in with GitHub
                </Button>
              </div>

              <div className='w-full pt-6 pb-6 text-center'>
                <p className='text-lg font-bold'>Or</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-6 w-full">
                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>Email or Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email or username" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-2/3 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>

              <div className='relative mt-6' onClick={() => router.push('/signup')}>
                <p className='text-base ml-2 font-font4 font-medium text-zinc-300'>
                Don&apos;t have an account? <span className="text-zinc-200 font-bold cursor-pointer">Sign up</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;