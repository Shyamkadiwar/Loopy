'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const postSchema = z.object({
    title: z.string(),
    description: z.string()
});
type postFormData = z.infer<typeof postSchema>;

function addPost() {
    const form = useForm<postFormData>({
        resolver : zodResolver(postSchema),
        defaultValues: {
            title: "",
            description: "",
        }
    })
    async function onSubmit(data : postFormData) {
        const response = await axios.post('api/posts/add-post', data)
    }
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center space-y-6 w-full">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormLabel className='text-sm text-gray-300'>description</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className='w-full border-[#353539] border-[1.5px] h-11 rounded-none !text-base' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-2/3 h-11 px-4 font-semibold bg-[#0a090f] py-2 text-lg border border-[#353539] rounded-lg text-white hover:bg-[#edecec] hover:text-black hover:font-semibold transition"
                    
                  >
                    
                  </Button>
                </form>
              </Form>
        </div>
    )
}

export default addPost