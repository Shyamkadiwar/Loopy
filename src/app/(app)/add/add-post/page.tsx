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

const postSchema = z.object({
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/))
        .optional()
        .default([]),
    links: z.array(z.string().url("Please enter a valid URL")).optional().default([])
})

type PostFormData = z.infer<typeof postSchema>

function AddPost() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast()
    const form = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            description: "",
            images: [],
            links: []
        }
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newLink, setNewLink] = useState("")
    const [linkError, setLinkError] = useState("")

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
        } catch {
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

    const addLink = () => {
        setLinkError("")
        try {
            if (!newLink) {
                setLinkError("Please enter a URL")
                return
            }
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
            if (!urlRegex.test(newLink)) {
                setLinkError("Please enter a valid URL")
                return
            }
            let formattedLink = newLink
            if (!/^https?:\/\//i.test(newLink)) {
                formattedLink = `https://${newLink}`
            }
            
            const currentLinks = form.getValues('links')
            form.setValue('links', [...currentLinks, formattedLink])
            setNewLink("")
        } catch {
            setLinkError("Invalid URL format")
        }
    }

    const removeLink = (index: number) => {
        const currentLinks = form.getValues('links')
        const newLinks = currentLinks.filter((_, i) => i !== index)
        form.setValue('links', newLinks)
    }

    async function onSubmit(data: PostFormData) {
        try {
            setIsSubmitting(true)
            const formData = new FormData()

            // Append basic fields
            formData.append('description', data.description)

            // Append images
            data.images?.forEach((image) => {
                formData.append('images', image)
            })

            // Append links if any
            data.links?.forEach((link) => {
                formData.append('links', link)
            })

            const response = await axios.post('/api/posts/add-post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Post created successfully",
                })
                form.reset()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create post. Please try again.",
            })
            console.error("Error creating post:", error)
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
                            aria-label="Search posts"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-10">
                        <Button onClick={() => router.push('/add/add-post')} className="text-white">
                            Create Post
                        </Button>
                        <ProfileDropdown user={session?.user} />
                    </div>
                </div>
                
                {/* form section */}
                <div className="flex-1 flex justify-center items-start overflow-y-auto">
                    <div className="w-full max-w-2xl px-4 py-6">
                        <div className="space-y-2 mb-6">
                            <h1 className="text-2xl font-bold text-white text-center">Create Post</h1>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel className='text-white'>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter post description"
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
                                    name="links"
                                    render={({ field }) => (
                                        <FormItem className='w-full'>
                                            <FormLabel className='text-white'>Links</FormLabel>
                                            <FormControl>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            type="text"
                                                            placeholder="Enter URL"
                                                            value={newLink}
                                                            onChange={(e) => setNewLink(e.target.value)}
                                                            className="flex-1 text-white border-[1px] border-[#353539]"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={addLink}
                                                            className="px-3 hover:bg-white bg-transparent hover:text-black border-[1px] border-[#353539] rounded-none"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {linkError && (
                                                        <p className="text-red-500 text-sm">{linkError}</p>
                                                    )}
                                                    <div className="space-y-2">
                                                        {field.value.map((link, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                                                <a 
                                                                    href={link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:underline truncate max-w-md"
                                                                >
                                                                    {link}
                                                                </a>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() => removeLink(index)}
                                                                    className="h-6 w-6"
                                                                >
                                                                    <X className="h-3 w-3" />
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
                                            'Create Post'
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

export default AddPost