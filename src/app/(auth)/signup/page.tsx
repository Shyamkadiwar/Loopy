'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounceCallback } from 'usehooks-ts';
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
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const signUpSchema = z.object({
  name: z.string().min(2, "Name should be minimum 2 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(7, "Password should be minimum 7 characters"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ isChecking: boolean; message: string; isAvailable?: boolean }>({
    isChecking: false,
    message: '',
  });
  const { toast } = useToast();
  
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    }
  });

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setUsernameStatus(prev => ({ ...prev, isChecking: true }));
    try {
      const response = await axios.get(`/api/check-username?username=${username}`);
      const { isAvailable, message } = response.data;
      
      setUsernameStatus({
        isChecking: false,
        message,
        isAvailable
      });
    } catch (_) {
      setUsernameStatus({
        isChecking: false,
        message: 'Error checking username',
      });
    }
  };

  const debouncedCheckUsername = useDebounceCallback(checkUsername, 500);

  const onSubmit = async (data: SignUpFormData) => {
    if (usernameStatus.isAvailable === false) {
      setError('Please choose a different username');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const response = await axios.post('/api/sign-up', data);
      toast({
        title: 'Success',
        description: response.data.message
      });
      router.push('/signin');
    }
    catch (_) {
      setError('An error occurred during sign up');
      toast({
        title: "Signup Failed",
        description: "Please try again later",
        variant: "destructive"
      });
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
              <Link href="/"><h1 className="text-9xl font-extrabold m-4 font-space-grotesk pl-4">LOOPY</h1></Link>
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

          {/* Right Section signup form */}
          <div className="w-2/6 border-[#353539] flex flex-col relative overflow-hidden">
            <div className="w-full border-[1px] hover:border-[#4b4b52] p-6 border-[#353539] flex flex-col items-center">
              <h2 className="text-lg text-center mb-10">Create An Account</h2>

              <div className='pb-4 w-full flex justify-center'>
                <Button
                  onClick={() => handleOAuthSignIn('google')}
                  className="w-2/4 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition flex items-center gap-2"
                >
                  <SiGoogle /> Continue with Google
                </Button>
              </div>

              <div className="pb-4 w-full flex justify-center">
                <Button
                  onClick={() => handleOAuthSignIn('github')}
                  className="w-2/4 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition flex items-center gap-2"
                >
                  <Github /> Continue with GitHub
                </Button>
              </div>

              <div className='w-full pt-6 pb-6 text-center'>
                <p className='text-lg font-bold'>Or</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-6 w-full">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                            className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base'
                            onChange={(e) => {
                              field.onChange(e);
                              debouncedCheckUsername(e.target.value);
                            }}
                          />
                        </FormControl>
                        {usernameStatus.isChecking && (
                          <p className="text-sm text-gray-400">Checking username...</p>
                        )}
                        {!usernameStatus.isChecking && usernameStatus.message && (
                          <p className={`text-sm ${usernameStatus.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                            {usernameStatus.message}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
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
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
              <div className='relative mt-6' onClick={() => router.push('/signin')}>
                <p className='text-base ml-2 font-font4 font-medium text-zinc-300'>
                  Already have an account? <span className="text-zinc-200 font-bold cursor-pointer">Sign in</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;