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
import { Loader2, X } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'

const articleSchema = z.object({
    title: z.string().min(3, "Minimum 3 character required"),
    description: z.string().min(3, "Minimum 3 character required"),
    images: z.array(z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/))
        .optional()
        .default([]),
    links: z.array(z.string().url()).optional().default([])
})

type ArticleFormData = z.infer<typeof articleSchema>

function AddArticle() {
    const { toast } = useToast()
    const form = useForm<ArticleFormData>({
        resolver: zodResolver(articleSchema),
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

    async function onSubmit(data: ArticleFormData) {
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

            const response = await axios.post('/api/articles/add-article', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Article created successfully",
                })
                form.reset()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create article. Please try again.",
            })
            console.error("Error creating article:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
            <AppSidebar />
            <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
                <div className="space-y-2 mt-4">
                    <h1 className="text-2xl font-bold text-white">Create articles</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className='text-white w-3/4'>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter article title"
                                            {...field}
                                            className='border-[1px] border-[#353539]'
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
                                <FormItem className='text-white'>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter article description"
                                            className="w-3/4 border-[1px] border-[#353539]"
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
                                <FormItem className='text-white'>
                                    <FormLabel>Images</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="cursor-pointer w-3/4 border-[1px] border-[#353539]"
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

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-1/4 hover:bg-white bg-transparent hover:text-black h-10 text-lg border-[1px] border-[#353539] rounded-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Article'
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default AddArticle