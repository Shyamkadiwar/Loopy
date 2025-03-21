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
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Search, X } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import ProfileDropdown from '@/components/ProfileDropdown'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

const questionSchema = z.object({
    title: z.string().min(3, "Minimum 3 character required"),
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/))
        .optional()
        .default([]),
    links: z.array(z.string().url()).optional().default([])
})

type QuestionFormData = z.infer<typeof questionSchema>

function AddQuestion() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast()
    const form = useForm<QuestionFormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            title: "",
            description: "",
            images: [],
            links: []
        }
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const imagePromises = files.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const result = e.target?.result as string
                    resolve(result)
                }
                reader.onerror = (e) => reject(e)
                reader.readAsDataURL(file)
            })
        })

        try {
            const base64Images = await Promise.all(imagePromises)
            const currentImages = form.getValues('images')
            form.setValue('images', [...currentImages, ...base64Images])
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process images. Please try again.",
            })
        }
    }

    const removeImage = (index: number) => {
        const currentImages = form.getValues('images')
        const newImages = currentImages.filter((_, i) => i !== index)
        form.setValue('images', newImages)
    }

    async function onSubmit(data: QuestionFormData) {
        try {
            setIsSubmitting(true)
            const formData = new FormData()

            // Append basic fields
            formData.append('title', data.title)
            formData.append('description', data.description)

            // Append images
            data.images?.forEach((image, index) => {
                formData.append('images', image)
            })

            // Append links if any
            data.links?.forEach((link, index) => {
                formData.append('links', link)
            })

            const response = await axios.post('/api/questions/add-question', {
                title: data.title,
                description: data.description,
                images: data.images || [],
                links: data.links || []
            });

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Question created successfully",
                })
                form.reset()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create question. Please try again.",
            })
            console.error("Error creating question:", error)
        } finally {
            setIsSubmitting(false)
        }
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
                            aria-label="Search questions"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-10">
                        <Button onClick={() => router.push('/add/add-question')} className="text-white">
                            Ask Question
                        </Button>
                        <ProfileDropdown user={session?.user} />
                    </div>
                </div>
                
                {/* form section */}
                <div className="flex-1 flex justify-center items-start overflow-y-auto">
                    <div className="w-full max-w-2xl px-4 py-6">
                        <div className="space-y-2 mb-6">
                            <h1 className="text-2xl font-bold text-white text-center">Ask Question</h1>
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
                                                    placeholder="Enter question title"
                                                    {...field}
                                                    className='text-white border-[1px] border-[#353539]'
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
                                                    placeholder="Enter question description"
                                                    className="text-white border-[1px] border-[#353539]"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel className='text-white'>Images</FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageChange}
                                                        className="cursor-pointer text-white border-[1px] border-[#353539]"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {field.value.map((image, index) => (
                                                            <div key={index} className="relative aspect-video">
                                                                <img
                                                                    src={image}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="object-cover rounded-lg w-full h-full"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
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
                                            'Ask Question'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddQuestion