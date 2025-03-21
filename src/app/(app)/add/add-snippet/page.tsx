'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { useSession } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Loader2, X, Plus, Search } from 'lucide-react';
import axios from 'axios';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/app-sidebar';
import ProfileDropdown from '@/components/ProfileDropdown';

const snippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  visibility: z.enum(["public", "private", "shared"]).default("public"),
  tags: z.array(z.string()).default([])
});

type SnippetFormData = z.infer<typeof snippetSchema>;

export default function AddSnippetForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');

  const form = useForm<SnippetFormData>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: '',
      code: '// Start coding here...',
      description: '',
      visibility: 'public',
      tags: []
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to create snippets",
      });
    }
  }, [status, router, toast]);

  const handleEditorChange = (value: string | undefined) => {
    form.setValue('code', value || '');
  };

  const addTag = () => {
    setTagError('');
    if (!newTag) {
      setTagError('Please enter a tag');
      return;
    }
    
    const currentTags = form.getValues('tags');
    form.setValue('tags', [...currentTags, newTag]);
    setNewTag('');
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags');
    const newTags = currentTags.filter((_, i) => i !== index);
    form.setValue('tags', newTags);
  };

  async function onSubmit(data: SnippetFormData) {
    if (status !== 'authenticated' || !session?.user?.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create snippets",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/snippet/add-snippet', {
        email: session?.user?.email,
        title: data.title,
        code: data.code,
        description: data.description,
        visibility: data.visibility,
        tags: data.tags
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Snippet created successfully",
        });
        form.reset();
        router.push(`/snippets/all-snippets`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || 'Failed to create snippet',
        });
        console.error('Error details:', response.data.errors);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create snippet. Please try again.",
      });
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
      <AppSidebar />
      
      <div className="w-full flex flex-col h-screen">
        {/* Header with search and profile */}
        <div className="flex p-4 justify-between items-center border-b-[1px] border-[#353539] sticky top-0 bg-[#0a090f] z-10">
          <div className="relative w-1/3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 text-lg border-[1px] border-[#353539] text-white"
              aria-label="Search snippets"
            />
          </div>
          <div className="flex justify-center items-center gap-10">
            <Button onClick={() => router.push('/add/add-snippet')} className="text-white">
              Create Snippet
            </Button>
            <ProfileDropdown user={session?.user} />
          </div>
        </div>
        
        {/* form section */}
        <div className="flex-1 flex justify-center items-start overflow-y-auto">
          <div className="w-full max-w-2xl px-4 py-6">
            <div className="space-y-2 mb-6">
              <h1 className="text-2xl font-bold text-white text-center">Create Snippet</h1>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-white'>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter snippet title"
                          className="text-white border-[1px] border-[#353539]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-white'>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter snippet description"
                          className="text-white border-[1px] border-[#353539]"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem className='w-full'>
                  <FormLabel className='text-white'>Language</FormLabel>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 text-white border-[1px] border-[#353539] bg-[#0a090f] rounded-md"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="sql">SQL</option>
                  </select>
                </FormItem>

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-white'>Code</FormLabel>
                      <FormControl>
                        <div className="overflow-hidden" style={{ height: '400px' }}>
                          <Editor
                            height="100%"
                            language={language}
                            value={field.value}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: true },
                              scrollBeyondLastLine: false,
                              fontSize: 18,
                              wordWrap: 'on',
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-white'>Tags</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="text"
                              placeholder="Enter tag"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="flex-1 text-white border-[1px] border-[#353539]"
                            />
                            <Button
                              type="button"
                              onClick={addTag}
                              className="px-3 hover:bg-white bg-transparent hover:text-black border-[1px] border-[#353539] rounded-none"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {tagError && (
                            <p className="text-red-500 text-sm">{tagError}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((tag, index) => (
                              <div key={index} className="flex items-center w-min justify-between p-2 bg-white rounded-full">
                                <span className="text-black truncate max-w-md pl-1">
                                  {tag}
                                </span>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => removeTag(index)}
                                  className="h-6 w-6 bg-transparent hover:bg-gray-200"
                                >
                                  <X className="h-4 w-4 font-black text-black" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='text-white'>Visibility</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 text-white border-[1px] border-[#353539] bg-[#0a090f] rounded-md"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="public">Public (visible to everyone)</option>
                          <option value="private">Private (only visible to you)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 hover:bg-white bg-transparent hover:text-black h-10 text-lg border-[1px] border-[#353539] rounded-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Snippet'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}